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
} from "@/lib/scraper-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

interface TrendyolProduct {
  id: number;
  name: string;
  brand: { name: string };
  price: { sellingPrice: { value: number }; originalPrice?: { value: number }; discountedPrice?: { value: number } };
  images: string[];
  url: string;
  categoryName?: string;
  ratingScore?: { averageRating: number; totalCount: number };
}

async function scrapeTrendyolSearch(
  query: string,
  pages: number = 10
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const url = `https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?q=${encodeURIComponent(query)}&pi=${page}&culture=tr-TR&storefrontId=1&language=tr&pId=0`;

      const response = await axios.get(url, {
        headers: {
          ...BROWSER_HEADERS,
          "Accept": "application/json",
          "Referer": "https://www.trendyol.com/",
          "Origin": "https://www.trendyol.com",
        },
        timeout: 15000,
      });

      const data = response.data;
      const items: TrendyolProduct[] = data?.result?.products || [];

      if (items.length === 0) break;

      for (const item of items) {
        try {
          const price =
            item.price?.discountedPrice?.value ||
            item.price?.sellingPrice?.value ||
            0;

          if (!price || price <= 0) continue;

          const productUrl = `https://www.trendyol.com${item.url}`;
          const ean = generateEAN(`trendyol-${item.id}`);
          const imageUrl = item.images?.[0]
            ? `https://cdn.dsmcdn.com/${item.images[0]}`
            : "https://placehold.co/400x400/111/e50914?text=Resim+Yok";
          const brand = item.brand?.name || extractBrand(item.name);
          const category = normalizeCategory(
            item.categoryName || query
          );

          products.push({
            ean,
            title: item.name,
            image: imageUrl,
            category,
            brand,
            vendor: "Trendyol",
            price,
            priceText: formatPriceTR(price),
            url: productUrl,
          });
        } catch {
          // Skip invalid products
        }
      }

      console.log(
        `[Trendyol] "${query}" sayfa ${page}/${pages} - ${items.length} ürün bulundu (toplam: ${products.length})`
      );

      // Rate limiting
      await randomDelay(300, 700);
    } catch (error: any) {
      console.error(
        `[Trendyol] "${query}" sayfa ${page} hata: ${error.message}`
      );
      if (error.response?.status === 429) {
        // Rate limited, wait longer
        await randomDelay(3000, 5000);
      }
      // Continue to next page
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
      `[Trendyol] Scraping başlıyor: "${query}", ${pages} sayfa`
    );

    const products = await scrapeTrendyolSearch(query, pages);

    if (products.length === 0) {
      return NextResponse.json({
        message: `"${query}" için ürün bulunamadı.`,
        products: 0,
        offers: 0,
      });
    }

    const result = await batchUpsertProducts(products);

    return NextResponse.json({
      message: `✅ Trendyol'dan "${query}" için ${result.newProducts} yeni ürün ve ${result.newOffers} teklif eklendi.`,
      query,
      scraped: products.length,
      ...result,
    });
  } catch (error: any) {
    console.error("[Trendyol] Genel hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
