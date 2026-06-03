import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Ürün sayısını göster
export async function GET() {
  const productCount = await prisma.product.count();
  const offerCount = await prisma.offer.count();
  return NextResponse.json({ products: productCount, offers: offerCount });
}

// Bu endpoint, yerel bilgisayardan scrape edilmiş ürünleri toplu olarak yükler
export async function POST(request: Request) {
  try {
    const { products, secretKey } = await request.json();

    // Basit güvenlik kontrolü
    if (secretKey !== "sanaiyifiyat2026") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Ürün listesi boş" }, { status: 400 });
    }

    let newProducts = 0;
    let newOffers = 0;
    let errors = 0;

    for (const item of products) {
      try {
        if (!item.title || !item.price || item.price <= 0) continue;

        let product = await prisma.product.findUnique({
          where: { ean: item.ean },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              ean: item.ean,
              title: item.title,
              image: item.image || "",
              category: item.category || "genel",
              brand: item.brand || "",
            },
          });
          newProducts++;
        }

        await prisma.offer.upsert({
          where: {
            productId_vendor: {
              productId: product.id,
              vendor: item.vendor,
            },
          },
          update: {
            price: item.price,
            priceText: item.priceText,
            url: item.url,
            updatedAt: new Date(),
          },
          create: {
            productId: product.id,
            vendor: item.vendor,
            price: item.price,
            priceText: item.priceText,
            url: item.url,
          },
        });
        newOffers++;
      } catch (e: any) {
        errors++;
      }
    }

    return NextResponse.json({
      message: `✅ ${newProducts} yeni ürün, ${newOffers} teklif eklendi. (${errors} hata atlandı)`,
      newProducts,
      newOffers,
      errors,
      totalReceived: products.length,
    });
  } catch (error: any) {
    console.error("[Upload] Hata:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
