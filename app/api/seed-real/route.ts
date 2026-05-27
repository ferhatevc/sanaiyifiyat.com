import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Önce veritabanındaki tüm eski (sahte) ürünleri siliyoruz
    await prisma.offer.deleteMany({});
    await prisma.product.deleteMany({});

    // 2. Gerçekçi Ürünleri Tanımlıyoruz
    const showcaseProducts = [
      {
        ean: "194253134123",
        title: "Apple iPhone 15 Pro Max 256GB Natürel Titanyum",
        image: "/images/iphone.png",
        category: "cep-telefonu",
        offers: [
          { vendor: "Hepsiburada", price: 74999, priceText: "74.999 TL", url: "#" },
          { vendor: "Trendyol", price: 75499, priceText: "75.499 TL", url: "#" },
          { vendor: "Apple TR", price: 82999, priceText: "82.999 TL", url: "#" }
        ]
      },
      {
        ean: "502515505321",
        title: "Dyson V15 Detect Absolute Şarjlı Dik Süpürge",
        image: "/images/dyson.png",
        category: "ev-aletleri",
        offers: [
          { vendor: "MediaMarkt", price: 24999, priceText: "24.999 TL", url: "#" },
          { vendor: "Trendyol", price: 23499, priceText: "23.499 TL", url: "#" },
          { vendor: "Dyson TR", price: 25999, priceText: "25.999 TL", url: "#" }
        ]
      },
      {
        ean: "711719541234",
        title: "Sony PlayStation 5 Oyun Konsolu 825GB",
        image: "/images/ps5.png",
        category: "ev-yasam",
        offers: [
          { vendor: "Vatan", price: 19999, priceText: "19.999 TL", url: "#" },
          { vendor: "Amazon", price: 18499, priceText: "18.499 TL", url: "#" },
          { vendor: "Hepsiburada", price: 18999, priceText: "18.999 TL", url: "#" }
        ]
      },
      {
        ean: "871010393214",
        title: "Philips Airfryer XXL Premium Fritöz (HD9867/90)",
        image: "/images/airfryer.png",
        category: "ev-aletleri",
        offers: [
          { vendor: "Trendyol", price: 6499, priceText: "6.499 TL", url: "#" },
          { vendor: "N11", price: 6199, priceText: "6.199 TL", url: "#" },
          { vendor: "Teknosa", price: 6799, priceText: "6.799 TL", url: "#" }
        ]
      },
      {
        ean: "352870123456",
        title: "Michelin Primacy 4 205/55 R16 91V Yaz Lastiği",
        image: "/images/michelin.png",
        category: "oto-sanayi",
        offers: [
          { vendor: "Lastikcim", price: 2150, priceText: "2.150 TL", url: "#" },
          { vendor: "Hepsiburada", price: 2300, priceText: "2.300 TL", url: "#" },
          { vendor: "Trendyol", price: 2090, priceText: "2.090 TL", url: "#" }
        ]
      },
      {
        ean: "880609012345",
        title: "Apple MacBook Pro M3 Çip 14 inç Uzay Siyahı",
        image: "/images/macbook.png",
        category: "bilgisayar",
        offers: [
          { vendor: "Amazon", price: 69999, priceText: "69.999 TL", url: "#" },
          { vendor: "Apple TR", price: 73999, priceText: "73.999 TL", url: "#" },
          { vendor: "Trendyol", price: 68500, priceText: "68.500 TL", url: "#" }
        ]
      },
      {
        ean: "195348123456",
        title: "Nike Air Force 1 '07 Beyaz Erkek Spor Ayakkabı",
        image: "/images/nike.png",
        category: "giyim",
        offers: [
          { vendor: "Nike TR", price: 4499, priceText: "4.499 TL", url: "#" },
          { vendor: "Hepsiburada", price: 4299, priceText: "4.299 TL", url: "#" },
          { vendor: "SuperStep", price: 4499, priceText: "4.499 TL", url: "#" }
        ]
      },
      {
        ean: "190199123456",
        title: "Nespresso Essenza Mini Kahve Makinesi",
        image: "/images/nespresso.png",
        category: "ev-aletleri",
        offers: [
          { vendor: "Amazon", price: 4499, priceText: "4.499 TL", url: "#" },
          { vendor: "Trendyol", price: 4299, priceText: "4.299 TL", url: "#" },
          { vendor: "Nespresso TR", price: 4999, priceText: "4.999 TL", url: "#" }
        ]
      }
    ];

    // 3. Veritabanına Yükleme İşlemi
    for (const data of showcaseProducts) {
      await prisma.product.create({
        data: {
          ean: data.ean,
          title: data.title,
          image: data.image,
          category: data.category,
          offers: {
            create: data.offers.map(offer => ({
              vendor: offer.vendor,
              price: offer.price,
              priceText: offer.priceText,
              url: offer.url
            }))
          }
        }
      });
    }

    return NextResponse.json({ 
      message: `🎉 HARİKA! O siyah test verileri tamamen silindi. Sitenize gerçekçi fotoğrafları olan toplam ${showcaseProducts.length} adet popüler ürün başarıyla eklendi!` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
