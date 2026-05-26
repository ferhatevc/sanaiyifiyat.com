const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 50.000 Stres Testi Ürünü Üretimi Başlıyor...");
    
    // Rastgele dağıtılacak kategoriler
    const categories = ['cep-telefonu', 'bilgisayar', 'ev-aletleri', 'giyim', 'oto-sanayi', 'ev-yasam'];
    
    // Gerçekçi görünmesi için markalar
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

    // Veritabanını çökertmemek için gruplar halinde (Chunk) ekleyeceğiz
    for (let i = 1; i <= 50000; i++) {
        const category = categories[i % categories.length];
        const categoryBrands = brands[category];
        const brand = categoryBrands[i % categoryBrands.length];
        
        const productId = `prod-mega-${i}`;
        
        products.push({
            id: productId,
            ean: `869${i.toString().padStart(8, '0')}`,
            title: `${brand} Ultra Performans Model ${i} (${category.toUpperCase()})`,
            image: `https://placehold.co/400x400/121212/e50914?text=${brand}+${i}`, // Gerçekçi gözükmeyen yer tutucu
            category: category
        });

        // Her ürüne 2 farklı satıcı fiyatı (Toplam 100.000 Teklif)
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
            price: basePrice - 100, // Hepsiburada 100 TL daha ucuz olsun
            priceText: `${(basePrice - 100).toLocaleString('tr-TR')} TL`,
            url: `https://www.hepsiburada.com/mock`
        });
    }

    console.log("📦 50.000 Ürün ve 100.000 Teklif belleğe alındı. Veritabanına (SQLite) yazılıyor...");
    
    // Prisma limitlerine takılmamak için 2.000'erli gruplar halinde (Chunk) ekliyoruz
    const chunkSize = 2000;
    
    for(let i = 0; i < products.length; i += chunkSize) {
        await prisma.product.createMany({ 
            data: products.slice(i, i + chunkSize) 
        });
        process.stdout.write(`\rÜrünler yükleniyor: %${Math.round(((i + chunkSize) / 50000) * 100)}`);
    }
    console.log("\n✅ Ürünler eklendi.");

    for(let i = 0; i < offers.length; i += chunkSize) {
        await prisma.offer.createMany({ 
            data: offers.slice(i, i + chunkSize) 
        });
        process.stdout.write(`\rTeklifler yükleniyor: %${Math.round(((i + chunkSize) / 100000) * 100)}`);
    }
    
    console.log("\n🎉 GÖREV TAMAMLANDI! Sistemde an itibariyle 50.000'den fazla ürün var!");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
