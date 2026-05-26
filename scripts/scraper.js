const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Şimdilik örnek olarak yasal bir test scraping sitesini (books.toscrape) kullanıyoruz.
// Altyapı oturduğunda buraya Hepsiburada/Trendyol/Amazon gibi sitelerin URL'leri eklenecek.
const TARGET_URL = 'http://books.toscrape.com/';

async function startScraping() {
    console.log('🤖 SanaiyiFiyat Veri Çekme (Scraping) Botu Başlatılıyor...');
    console.log(`📡 Hedef URL'ye Bağlanılıyor: ${TARGET_URL}`);
    
    try {
        // 1. Sayfanın HTML kodlarını indir
        const response = await axios.get(TARGET_URL);
        const html = response.data;
        console.log('✅ HTML verisi indirildi. Parse ediliyor...');
        
        // 2. Cheerio kütüphanesi ile HTML'i analiz et (jQuery mantığı)
        const $ = cheerio.load(html);
        const products = [];

        // 3. Sitedeki her bir ürün kartını bul ve içindeki bilgileri ayıkla
        $('article.product_pod').each((index, element) => {
            // Başlık
            const title = $(element).find('h3 a').attr('title');
            
            // Fiyat (Örn: £51.77 metnini 51.77 sayısına çevir)
            const priceText = $(element).find('.price_color').text();
            const price = parseFloat(priceText.replace('£', ''));
            
            // Görsel ve Link
            const image = $(element).find('.image_container img').attr('src');
            const productUrl = $(element).find('h3 a').attr('href');

            products.push({
                title: title,
                // Kuru örnek olarak 40 ile çarpıp TL'ye çeviriyoruz
                price: parseFloat((price * 40).toFixed(2)), 
                vendor: 'Örnek Satıcı (Toscrape)',
                image: `http://books.toscrape.com/${image}`,
                url: `http://books.toscrape.com/${productUrl}`,
                scrapedAt: new Date().toISOString()
            });
        });

        console.log(`🔥 Toplam ${products.length} adet ürün başarıyla ayıklandı!`);
        
        // 4. Veriyi JSON dosyasına kaydet (Gelecek adımda MySQL'e yazdıracağız)
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const outputPath = path.join(dataDir, 'scraped_products.json');
        fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
        
        console.log(`💾 Veriler başarıyla veritabanına (şu an için JSON formatında) kaydedildi: data/scraped_products.json`);
        
    } catch (error) {
        console.error('❌ Bot çalışırken bir hata oluştu:', error.message);
    }
}

startScraping();
