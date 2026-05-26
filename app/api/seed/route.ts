import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 saniye timeout süresi (Next.js config)

export async function GET() {
    try {
        console.log("🚀 API Üzerinden Ürün Üretimi Başlıyor...");
        
        // Veritabanında ürün var mı kontrol et (Mükerrer eklemeyi önle)
        const count = await prisma.product.count();
        if (count > 0) {
            return NextResponse.json({ message: `Sistemde zaten ${count} ürün var. Ek işlem yapılmadı.` });
        }

        const categories = ['cep-telefonu', 'bilgisayar', 'ev-aletleri', 'giyim', 'oto-sanayi', 'ev-yasam'];
        const brands = {
            'cep-telefonu': ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Huawei'],
            'bilgisayar': ['Asus', 'Lenovo', 'HP', 'Dell', 'MSI'],
            'ev-aletleri': ['Bosch', 'Siemens', 'Beko', 'Arçelik', 'Philips'],
            'giyim': ['Nike', 'Adidas', 'Puma', 'Mavi', 'LCW'],
            'oto-sanayi': ['Michelin', 'Lassa', 'Petlas', 'Castrol', 'Motul'],
            'ev-yasam': ['Karaca', 'IKEA', 'Taç', 'Paşabahçe', 'English Home']
        };

        const products = [];
        const offers = [];

        for (let i = 1; i <= 50000; i++) {
            const category = categories[i % categories.length] as keyof typeof brands;
            const categoryBrands = brands[category];
            const brand = categoryBrands[i % categoryBrands.length];
            
            const productId = `prod-mega-${i}`;
            
            products.push({
                id: productId,
                ean: `869${i.toString().padStart(8, '0')}`,
                title: `${brand} Ultra Performans Model ${i} (${category.toUpperCase()})`,
                image: `https://placehold.co/400x400/121212/e50914?text=${brand}+${i}`,
                category: category
            });

            const basePrice = (1000 + (i % 5000)) + 0.99;
            
            offers.push({
                id: `off-a-${i}`,
                productId: productId,
                vendor: 'Trendyol',
                price: basePrice,
                priceText: `${basePrice.toLocaleString('tr-TR')} TL`,
                url: `https://www.trendyol.com/mock`
            });
            
            offers.push({
                id: `off-b-${i}`,
                productId: productId,
                vendor: 'Hepsiburada',
                price: basePrice - 100,
                priceText: `${(basePrice - 100).toLocaleString('tr-TR')} TL`,
                url: `https://www.hepsiburada.com/mock`
            });
        }

        const chunkSize = 2000;
        
        for(let i = 0; i < products.length; i += chunkSize) {
            await prisma.product.createMany({ 
                data: products.slice(i, i + chunkSize) 
            });
        }

        for(let i = 0; i < offers.length; i += chunkSize) {
            await prisma.offer.createMany({ 
                data: offers.slice(i, i + chunkSize) 
            });
        }
        
        return NextResponse.json({ message: "🎉 GÖREV TAMAMLANDI! 50.000 ürün ve 100.000 teklif başarıyla yüklendi!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
