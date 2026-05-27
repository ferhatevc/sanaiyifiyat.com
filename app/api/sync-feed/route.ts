import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json({ error: "Eksik parametre: id" }, { status: 400 });
    }

    const feed = await prisma.affiliateFeed.findUnique({ where: { id } });
    if (!feed) {
      return NextResponse.json({ error: "Feed bulunamadı" }, { status: 404 });
    }

    // Durumu güncelliyoruz
    await prisma.affiliateFeed.update({
      where: { id },
      data: { status: "syncing" }
    });

    console.log(`[BOT] XML çekiliyor: ${feed.url}`);
    
    // Güvenlik ve Prototipler için: Eğer url localhost veya kendi sitemiz ise fetch edebilsin
    // Ancak dışarıdan gelen XML'ler için axios ile çekelim
    let xmlData = "";
    try {
        const response = await axios.get(feed.url, { timeout: 15000 });
        xmlData = response.data;
    } catch (e: any) {
        await prisma.affiliateFeed.update({
            where: { id },
            data: { status: "error" }
        });
        return NextResponse.json({ error: "XML URL'sine ulaşılamadı veya zaman aşımına uğradı." }, { status: 500 });
    }

    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);

    // Genel XML standartlarına göre ürün dizisini bulmaya çalışıyoruz
    let productsArray: any[] = [];
    if (jsonObj?.products?.product) {
        productsArray = Array.isArray(jsonObj.products.product) ? jsonObj.products.product : [jsonObj.products.product];
    } else if (jsonObj?.urunler?.urun) {
        productsArray = Array.isArray(jsonObj.urunler.urun) ? jsonObj.urunler.urun : [jsonObj.urunler.urun];
    } else if (jsonObj?.rss?.channel?.item) {
        productsArray = Array.isArray(jsonObj.rss.channel.item) ? jsonObj.rss.channel.item : [jsonObj.rss.channel.item];
    } else {
        await prisma.affiliateFeed.update({ where: { id }, data: { status: "error" } });
        return NextResponse.json({ error: "XML formatı anlaşılamadı. Lütfen standart Google Merchant veya ReklamAction XML'i kullanın." }, { status: 400 });
    }

    let newProducts = 0;
    let newOffers = 0;

    for (const item of productsArray) {
        // XML Alan Eşleştirmeleri (Farklı formatları tolere et)
        const ean = item.ean || item.barcode || item.gtin || item.id || Math.random().toString();
        const title = item.title || item.isim || item.name || "İsimsiz Ürün";
        const image = item.image || item.resim || item.image_link || "https://placehold.co/400x400/111/e50914?text=Resim+Yok";
        const category = item.category || item.kategori || "genel";
        let price = item.price || item.fiyat || 0;
        const url = item.url || item.link || "#";

        // Fiyat temizleme
        if (typeof price === 'string') {
            price = parseFloat(price.replace(/[^0-9,.]/g, '').replace(',', '.'));
        }
        
        const priceText = price.toLocaleString('tr-TR') + " TL";

        let product = await prisma.product.findUnique({
            where: { ean: String(ean) }
        });

        if (!product) {
            product = await prisma.product.create({
                data: { ean: String(ean), title, image, category }
            });
            newProducts++;
        }

        await prisma.offer.upsert({
            where: {
                productId_vendor: { productId: product.id, vendor: feed.vendor }
            },
            update: { price, priceText, url, updatedAt: new Date() },
            create: { productId: product.id, vendor: feed.vendor, price, priceText, url }
        });
        newOffers++;
    }

    // İşlem başarılı, durumu güncelle
    await prisma.affiliateFeed.update({
        where: { id },
        data: { status: "success", lastSyncAt: new Date() }
    });

    return NextResponse.json({ 
        message: `XML başarıyla okundu. ${newProducts} yeni ürün ve ${newOffers} yeni teklif veritabanına işlendi.`,
        success: true 
    });

  } catch (error: any) {
    console.error("XML Sync Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
