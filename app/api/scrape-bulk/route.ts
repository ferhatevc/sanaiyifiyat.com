import { NextResponse } from "next/server";
import axios from "axios";
import {
  generateEAN,
  randomDelay,
  BROWSER_HEADERS,
  ScrapedProduct,
  batchUpsertProducts,
  normalizeCategory,
  formatPriceTR,
  extractBrand,
  SEARCH_TERMS,
} from "@/lib/scraper-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 dakika

// Trendyol'dan tek bir arama terimi için ürünleri çek
async function scrapeTrendyol(
  query: string,
  pages: number
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const url = `https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?q=${encodeURIComponent(query)}&pi=${page}&culture=tr-TR&storefrontId=1&language=tr&pId=0`;

      const response = await axios.get(url, {
        headers: {
          ...BROWSER_HEADERS,
          Accept: "application/json",
          Referer: "https://www.trendyol.com/",
          Origin: "https://www.trendyol.com",
        },
        timeout: 15000,
      });

      const items = response.data?.result?.products || [];
      if (items.length === 0) break;

      for (const item of items) {
        try {
          const price =
            item.price?.discountedPrice?.value ||
            item.price?.sellingPrice?.value ||
            0;
          if (!price || price <= 0) continue;

          const productUrl = `https://www.trendyol.com${item.url}`;
          const imageUrl = item.images?.[0]
            ? `https://cdn.dsmcdn.com/${item.images[0]}`
            : "";

          if (!imageUrl) continue;

          products.push({
            ean: generateEAN(`trendyol-${item.id}`),
            title: item.name,
            image: imageUrl,
            category: normalizeCategory(item.categoryName || query),
            brand: item.brand?.name || extractBrand(item.name),
            vendor: "Trendyol",
            price,
            priceText: formatPriceTR(price),
            url: productUrl,
          });
        } catch {
          // Skip
        }
      }

      await randomDelay(200, 500);
    } catch (error: any) {
      if (error.response?.status === 429) {
        await randomDelay(3000, 5000);
      }
      break; // Move to next search term
    }
  }

  return products;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagesPerTerm = parseInt(searchParams.get("pages") || "5");
    const startIndex = parseInt(searchParams.get("start") || "0");
    const batchSize = parseInt(searchParams.get("batch") || "20");
    const source = searchParams.get("source") || "trendyol";

    // İşlenecek arama terimlerini belirle
    const termsToProcess = SEARCH_TERMS.slice(
      startIndex,
      startIndex + batchSize
    );

    if (termsToProcess.length === 0) {
      return NextResponse.json({
        message: "Tüm kategoriler tamamlandı!",
        totalTerms: SEARCH_TERMS.length,
        processed: startIndex,
      });
    }

    let totalNewProducts = 0;
    let totalNewOffers = 0;
    let totalScraped = 0;
    const results: { term: string; scraped: number; saved: number }[] = [];

    for (const term of termsToProcess) {
      console.log(
        `\n🔍 [BULK] Scraping: "${term}" (${results.length + 1}/${termsToProcess.length})`
      );

      let products: ScrapedProduct[] = [];

      if (source === "trendyol") {
        products = await scrapeTrendyol(term, pagesPerTerm);
      }

      if (products.length > 0) {
        const result = await batchUpsertProducts(products);
        totalNewProducts += result.newProducts;
        totalNewOffers += result.newOffers;
        totalScraped += products.length;

        results.push({
          term,
          scraped: products.length,
          saved: result.newOffers,
        });

        console.log(
          `   ✅ "${term}": ${products.length} ürün çekildi, ${result.newProducts} yeni ürün, ${result.newOffers} teklif kaydedildi`
        );
      } else {
        results.push({ term, scraped: 0, saved: 0 });
        console.log(`   ⚠️ "${term}": Ürün bulunamadı`);
      }

      // Terimler arası bekleme
      await randomDelay(500, 1000);
    }

    const nextStart = startIndex + batchSize;
    const hasMore = nextStart < SEARCH_TERMS.length;

    return NextResponse.json({
      message: `✅ ${termsToProcess.length} kategori tarandı. ${totalNewProducts} yeni ürün, ${totalNewOffers} teklif eklendi.`,
      summary: {
        processedTerms: termsToProcess.length,
        totalScraped,
        newProducts: totalNewProducts,
        newOffers: totalNewOffers,
      },
      progress: {
        current: nextStart,
        total: SEARCH_TERMS.length,
        percentage: Math.round((nextStart / SEARCH_TERMS.length) * 100),
        hasMore,
        nextUrl: hasMore
          ? `/api/scrape-bulk?start=${nextStart}&batch=${batchSize}&pages=${pagesPerTerm}&source=${source}`
          : null,
      },
      results,
    });
  } catch (error: any) {
    console.error("[BULK] Genel hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
