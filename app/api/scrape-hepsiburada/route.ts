import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  generateEAN,
  randomDelay,
  BROWSER_HEADERS,
  ScrapedProduct,
  batchUpsertProducts,
  normalizeCategory,
  formatPriceTR,
  extractBrand,
} from "@/lib/scraper-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function scrapeHepsiburadaSearch(
  query: string,
  pages: number = 10
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const url = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(query)}&sayfa=${page}`;

      const response = await axios.get(url, {
        headers: {
          ...BROWSER_HEADERS,
          "Referer": "https://www.hepsiburada.com/",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Try to find product data in JSON-LD
      const jsonLdScripts = $('script[type="application/ld+json"]');
      let foundProducts = false;

      jsonLdScripts.each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || "{}");
          if (json["@type"] === "ItemList" && json.itemListElement) {
            for (const item of json.itemListElement) {
              const product = item.item || item;
              if (product.name && product.offers) {
                const price =
                  product.offers?.lowPrice ||
                  product.offers?.price ||
                  product.offers?.[0]?.price ||
                  0;
                const productUrl = product.url || product["@id"] || "";
                const fullUrl = productUrl.startsWith("http")
                  ? productUrl
                  : `https://www.hepsiburada.com${productUrl}`;

                products.push({
                  ean: generateEAN(`hb-${fullUrl}`),
                  title: product.name,
                  image: product.image || product.image?.[0] || "",
                  category: normalizeCategory(query),
                  brand: product.brand?.name || extractBrand(product.name),
                  vendor: "Hepsiburada",
                  price: parseFloat(price) || 0,
                  priceText: formatPriceTR(parseFloat(price) || 0),
                  url: fullUrl,
                });
                foundProducts = true;
              }
            }
          }
        } catch {
          // Skip invalid JSON-LD
        }
      });

      // Fallback: parse HTML product cards
      if (!foundProducts) {
        // Hepsiburada uses various selectors for product cards
        const selectors = [
          '[data-test-id="product-card-item"]',
          ".productListContent-item",
          ".search-item",
          'li[class*="productListContent"]',
          'a[href*="/p-"]',
        ];

        let productCards = $([]);
        for (const sel of selectors) {
          productCards = $(sel);
          if (productCards.length > 0) break;
        }

        productCards.each((_, el) => {
          try {
            const $el = $(el);
            const link =
              $el.find("a").first().attr("href") || $el.attr("href") || "";
            const title =
              $el.find('[data-test-id="product-card-name"]').text().trim() ||
              $el.find(".product-title").text().trim() ||
              $el.find("h3").text().trim() ||
              $el.find("a").first().attr("title") ||
              "";
            const priceText =
              $el.find('[data-test-id="price-current-price"]').text().trim() ||
              $el.find(".product-price").text().trim() ||
              $el.find('[class*="price"]').first().text().trim() ||
              "";
            const image =
              $el.find("img").first().attr("src") ||
              $el.find("img").first().attr("data-src") ||
              "";

            if (!title || !link) return;

            const price = parseFloat(
              priceText.replace(/[^0-9,]/g, "").replace(",", ".")
            );
            const fullUrl = link.startsWith("http")
              ? link
              : `https://www.hepsiburada.com${link}`;
            const fullImage = image.startsWith("http")
              ? image
              : image
                ? `https://www.hepsiburada.com${image}`
                : "";

            if (price > 0) {
              products.push({
                ean: generateEAN(`hb-${fullUrl}`),
                title,
                image:
                  fullImage ||
                  "https://placehold.co/400x400/111/e50914?text=Resim+Yok",
                category: normalizeCategory(query),
                brand: extractBrand(title),
                vendor: "Hepsiburada",
                price,
                priceText: formatPriceTR(price),
                url: fullUrl,
              });
            }
          } catch {
            // Skip invalid product card
          }
        });
      }

      console.log(
        `[Hepsiburada] "${query}" sayfa ${page}/${pages} - toplam: ${products.length}`
      );

      await randomDelay(400, 900);
    } catch (error: any) {
      console.error(
        `[Hepsiburada] "${query}" sayfa ${page} hata: ${error.message}`
      );
      if (error.response?.status === 429 || error.response?.status === 403) {
        await randomDelay(5000, 8000);
      }
    }
  }

  return products;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "telefon";
    const pages = parseInt(searchParams.get("pages") || "10");

    console.log(
      `[Hepsiburada] Scraping başlıyor: "${query}", ${pages} sayfa`
    );

    const products = await scrapeHepsiburadaSearch(query, pages);

    if (products.length === 0) {
      return NextResponse.json({
        message: `"${query}" için ürün bulunamadı.`,
        products: 0,
        offers: 0,
      });
    }

    const result = await batchUpsertProducts(products);

    return NextResponse.json({
      message: `✅ Hepsiburada'dan "${query}" için ${result.newProducts} yeni ürün ve ${result.newOffers} teklif eklendi.`,
      query,
      scraped: products.length,
      ...result,
    });
  } catch (error: any) {
    console.error("[Hepsiburada] Genel hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
