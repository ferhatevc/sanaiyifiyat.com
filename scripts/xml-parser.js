const { PrismaClient } = require('@prisma/client');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function startXMLParser() {
    console.log('🚀 Profesyonel XML Entegrasyon Motoru Başlatılıyor...');
    
    const xmlFilePath = path.join(__dirname, '..', 'data', 'mock-feed.xml');
    
    if (!fs.existsSync(xmlFilePath)) {
        console.error('❌ XML dosyası bulunamadı!');
        process.exit(1);
    }

    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log('✅ XML Dosyası belleğe alındı. Ayrıştırılıyor...');

    // XML'i JSON nesnesine çeviriyoruz
    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);
    
    const productsArray = jsonObj.products.product;
    console.log(`📦 XML içerisinde toplam ${productsArray.length} adet veri bulundu. Eşleştirme başlıyor...`);

    let newProducts = 0;
    let newOffers = 0;

    for (const item of productsArray) {
        const ean = String(item.ean);
        const priceText = item.price.toLocaleString('tr-TR') + " TL";

        // 1. Önce "Ana Ürün"        // Veritabanında (Product tablosunda) bu EAN koduna sahip ürün var mı?
        let product = await prisma.product.findUnique({
            where: { ean: String(item.ean) }
        });

        if (!product) {
            // Yeni ürün oluştur
            product = await prisma.product.create({
                data: {
                    ean: String(item.ean),
                    title: item.title,
                    image: item.image,
                    category: item.category || 'genel',
                }
            });
            newProducts++;
        }

        // 3. Ürün sistemde var olduğuna göre (veya yeni oluştuğuna göre), mağazanın teklifini (Offer) bu ürüne bağlıyoruz
        // Eğer bu mağaza bu ürüne zaten teklif verdiyse sadece fiyatını güncelliyoruz (Upsert)
        await prisma.offer.upsert({
            where: {
                productId_vendor: {
                    productId: product.id,
                    vendor: item.vendor
                }
            },
            update: {
                price: parseFloat(item.price),
                priceText: priceText,
                url: item.url,
                updatedAt: new Date()
            },
            create: {
                productId: product.id,
                vendor: item.vendor,
                price: parseFloat(item.price),
                priceText: priceText,
                url: item.url
            }
        });
        newOffers++;
    }

    console.log('----------------------------------------------------');
    console.log(`🎉 ENTEGRASYON TAMAMLANDI!`);
    console.log(`🆕 ${newProducts} adet Yeni Ürün kataloğa eklendi.`);
    console.log(`🏷️  Toplam ${newOffers} adet Fiyat Teklifi eşleştirildi veya güncellendi.`);
    console.log('----------------------------------------------------');

    await prisma.$disconnect();
}

startXMLParser();
