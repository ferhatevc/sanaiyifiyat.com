import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  generateEAN,
  randomDelay,
  ScrapedProduct,
  batchUpsertProducts,
  normalizeCategory,
  formatPriceTR,
  extractBrand,
  SEARCH_TERMS,
} from "@/lib/scraper-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const AMAZON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Accept-Language": "tr-TR,tr;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// Amazon affiliate tag
const AFFILIATE_TAG = "sanaiyifiyat-21";

async function scrapeAmazonSearch(
  query: string,
  pages: number = 3
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const url = `https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}&page=${page}&tag=${AFFILIATE_TAG}`;

      const response = await axios.get(url, {
        headers: AMAZON_HEADERS,
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);

      // Find all product cards
      $('[data-asin]').each((_, el) => {
        try {
          const $el = $(el);
          const asin = $el.attr("data-asin");
          if (!asin || asin.length < 5) return;

          // Title
          const title =
            $el.find("span.a-size-base-plus.a-color-base.a-text-normal").text().trim() ||
            $el.find("span.a-size-medium.a-color-base.a-text-normal").text().trim() ||
            $el.find("span.a-text-normal").text().trim() ||
            $el.find("h2 span").text().trim();

          if (!title || title.length < 5) return;

          // Price
          const priceWhole = $el.find("span.a-price-whole").first().text().replace(/[^0-9]/g, "");
          const priceFraction = $el.find("span.a-price-fraction").first().text().replace(/[^0-9]/g, "") || "00";
          
          if (!priceWhole) return;
          
          const price = parseFloat(`${priceWhole}.${priceFraction}`);
          if (price <= 0 || isNaN(price)) return;

          // Image
          const image =
            $el.find("img.s-image").attr("src") || "";

          if (!image) return;

          // Product URL with affiliate tag
          const href =
            $el.find("a.a-link-normal.s-no-outline").attr("href") ||
            $el.find("h2 a").attr("href") ||
            $el.find("a[href*='/dp/']").first().attr("href") ||
            "";

          const productUrl = href.startsWith("http")
            ? href
            : `https://www.amazon.com.tr${href}`;

          // Add affiliate tag to URL
          const affiliateUrl = productUrl.includes("?")
            ? `${productUrl}&tag=${AFFILIATE_TAG}`
            : `${productUrl}?tag=${AFFILIATE_TAG}`;

          // Rating (optional)
          const ratingText = $el.find("span.a-icon-alt").first().text();

          const category = normalizeCategory(query);
          const brand = extractBrand(title);

          products.push({
            ean: generateEAN(`amazon-${asin}`),
            title,
            image,
            category,
            brand,
            vendor: "Amazon",
            price,
            priceText: formatPriceTR(price),
            url: affiliateUrl,
          });
        } catch {
          // Skip invalid product card
        }
      });

      console.log(
        `[Amazon] "${query}" sayfa ${page}/${pages} - toplam: ${products.length}`
      );

      // Rate limiting - Amazon is strict
      await randomDelay(1000, 2000);
    } catch (error: any) {
      console.error(
        `[Amazon] "${query}" sayfa ${page} hata: ${error.message}`
      );
      if (error.response?.status === 503 || error.response?.status === 429) {
        console.log("[Amazon] Rate limited, uzun bekleme...");
        await randomDelay(5000, 10000);
      }
      break;
    }
  }

  return products;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const pages = parseInt(searchParams.get("pages") || "3");
    const bulk = searchParams.get("bulk") === "true";
    const startIndex = parseInt(searchParams.get("start") || "0");
    const batchSize = parseInt(searchParams.get("batch") || "10");

    // BULK MODE: Tüm kategorileri tara
    if (bulk || !query) {
      const termsToProcess = SEARCH_TERMS.slice(startIndex, startIndex + batchSize);

      if (termsToProcess.length === 0) {
        return NextResponse.json({
          message: "🎉 Tüm kategoriler tamamlandı!",
          totalTerms: SEARCH_TERMS.length,
        });
      }

      let totalNewProducts = 0;
      let totalNewOffers = 0;
      let totalScraped = 0;
      const results: { term: string; scraped: number; saved: number }[] = [];

      for (const term of termsToProcess) {
        console.log(`\n🔍 [Amazon BULK] "${term}" (${results.length + 1}/${termsToProcess.length})`);

        const products = await scrapeAmazonSearch(term, pages);

        if (products.length > 0) {
          const result = await batchUpsertProducts(products);
          totalNewProducts += result.newProducts;
          totalNewOffers += result.newOffers;
          totalScraped += products.length;
          results.push({ term, scraped: products.length, saved: result.newOffers });
          console.log(`   ✅ "${term}": ${products.length} ürün, ${result.newProducts} yeni`);
        } else {
          results.push({ term, scraped: 0, saved: 0 });
        }

        await randomDelay(1500, 3000);
      }

      const nextStart = startIndex + batchSize;
      const hasMore = nextStart < SEARCH_TERMS.length;

      return NextResponse.json({
        message: `✅ Amazon'dan ${totalNewProducts} yeni ürün, ${totalNewOffers} teklif eklendi.`,
        summary: { totalScraped, newProducts: totalNewProducts, newOffers: totalNewOffers },
        progress: {
          current: nextStart,
          total: SEARCH_TERMS.length,
          percentage: Math.round((nextStart / SEARCH_TERMS.length) * 100),
          hasMore,
          nextUrl: hasMore
            ? `/api/scrape-amazon?bulk=true&start=${nextStart}&batch=${batchSize}&pages=${pages}`
            : null,
        },
        results,
      });
    }

    // SINGLE QUERY MODE
    console.log(`[Amazon] Scraping: "${query}", ${pages} sayfa`);
    const products = await scrapeAmazonSearch(query, pages);

    if (products.length === 0) {
      return NextResponse.json({
        message: `"${query}" için Amazon'da ürün bulunamadı.`,
        products: 0,
        offers: 0,
      });
    }

    const result = await batchUpsertProducts(products);

    return NextResponse.json({
      message: `✅ Amazon'dan "${query}" için ${result.newProducts} yeni ürün ve ${result.newOffers} teklif eklendi.`,
      query,
      scraped: products.length,
      ...result,
    });
  } catch (error: any) {
    console.error("[Amazon] Genel hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
