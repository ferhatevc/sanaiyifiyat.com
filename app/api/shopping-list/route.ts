import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Liste boş" }, { status: 400 });
    }

    // Max 20 item
    const searchItems = items.slice(0, 20);
    const results = [];

    for (const item of searchItems) {
      const query = item.trim();
      if (!query) continue;

      // Veritabanında ara — kelime bazlı arama
      const words = query.split(/\s+/).filter((w: string) => w.length > 1);
      
      const products = await prisma.product.findMany({
        where: {
          AND: words.map((word: string) => ({
            title: { contains: word },
          })),
        },
        include: {
          offers: {
            orderBy: { price: "asc" },
          },
        },
        take: 5,
      });

      if (products.length > 0) {
        // En ucuz teklifi olan ürünü bul
        let bestProduct = null;
        let bestOffer = null;
        let allOffers: any[] = [];

        for (const product of products) {
          if (product.offers.length > 0) {
            const cheapest = product.offers[0]; // Already sorted by price asc
            allOffers.push(
              ...product.offers.map((o) => ({
                vendor: o.vendor,
                price: o.price,
                priceText: o.priceText,
                url: o.url,
              }))
            );

            if (!bestOffer || cheapest.price < bestOffer.price) {
              bestOffer = cheapest;
              bestProduct = product;
            }
          }
        }

        if (bestProduct && bestOffer) {
          // En pahalı teklifi bul (tasarruf hesabı için)
          const maxPrice = Math.max(...allOffers.map((o) => o.price));
          const savings = maxPrice - bestOffer.price;

          results.push({
            query,
            found: true,
            product: {
              id: bestProduct.id,
              title: bestProduct.title,
              image: bestProduct.image,
              brand: bestProduct.brand,
              category: bestProduct.category,
            },
            bestOffer: {
              vendor: bestOffer.vendor,
              price: bestOffer.price,
              priceText: bestOffer.priceText,
              url: bestOffer.url,
            },
            totalOffers: allOffers.length,
            maxPrice,
            savings,
            savingsText:
              savings > 0
                ? savings.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL"
                : "0 TL",
            alternatives: allOffers.slice(0, 5),
          });
        } else {
          results.push({ query, found: false });
        }
      } else {
        results.push({ query, found: false });
      }
    }

    // Toplam hesaplama
    const totalCheapest = results
      .filter((r) => r.found)
      .reduce((sum, r) => sum + (r.bestOffer?.price || 0), 0);
    const totalExpensive = results
      .filter((r) => r.found)
      .reduce((sum, r) => sum + (r.maxPrice || 0), 0);
    const totalSavings = totalExpensive - totalCheapest;

    return NextResponse.json({
      results,
      summary: {
        totalItems: searchItems.length,
        foundItems: results.filter((r) => r.found).length,
        notFoundItems: results.filter((r) => !r.found).length,
        totalCheapest,
        totalCheapestText:
          totalCheapest.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) +
          " TL",
        totalExpensive,
        totalExpensiveText:
          totalExpensive.toLocaleString("tr-TR", {
            maximumFractionDigits: 0,
          }) + " TL",
        totalSavings,
        totalSavingsText:
          totalSavings.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) +
          " TL",
      },
    });
  } catch (error: any) {
    console.error("[Shopping List] Hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
