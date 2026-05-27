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
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=600&q=80",
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
        image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=600&q=80",
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
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
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
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
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
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80",
        category: "oto-sanayi",
        offers: [
          { vendor: "Lastikcim", price: 2150, priceText: "2.150 TL", url: "#" },
          { vendor: "Hepsiburada", price: 2300, priceText: "2.300 TL", url: "#" },
          { vendor: "Trendyol", price: 2090, priceText: "2.090 TL", url: "#" }
        ]
      },
      {
        ean: "880609012345",
        title: "Samsung Galaxy S24 Ultra 512GB Titanyum Gri",
        image: "https://images.unsplash.com/photo-1610945265064-3234dac15059?auto=format&fit=crop&w=600&q=80",
        category: "cep-telefonu",
        offers: [
          { vendor: "Amazon", price: 69999, priceText: "69.999 TL", url: "#" },
          { vendor: "Samsung TR", price: 73999, priceText: "73.999 TL", url: "#" },
          { vendor: "Trendyol", price: 68500, priceText: "68.500 TL", url: "#" }
        ]
      },
      {
        ean: "195348123456",
        title: "Lenovo IdeaPad Slim 3 Intel Core i5 16GB RAM",
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
        category: "bilgisayar",
        offers: [
          { vendor: "Teknosa", price: 14999, priceText: "14.999 TL", url: "#" },
          { vendor: "Hepsiburada", price: 13499, priceText: "13.499 TL", url: "#" },
          { vendor: "Amazon", price: 13999, priceText: "13.999 TL", url: "#" }
        ]
      },
      {
        ean: "190199123456",
        title: "Apple AirPods Pro (2. Nesil) Bluetooth Kulaklık",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
        category: "cep-telefonu",
        offers: [
          { vendor: "Amazon", price: 7499, priceText: "7.499 TL", url: "#" },
          { vendor: "Trendyol", price: 7299, priceText: "7.299 TL", url: "#" },
          { vendor: "Apple TR", price: 8999, priceText: "8.999 TL", url: "#" }
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
