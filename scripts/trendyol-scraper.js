const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// Bot korumalarını atlatmak için Stealth eklentisini aktif ediyoruz
puppeteer.use(StealthPlugin());

// Hedef URL: Örnek olarak Trendyol Cep Telefonu araması
const TARGET_URL = 'https://www.trendyol.com/sr?q=cep+telefonu';

async function startRealScraping() {
    console.log('🤖 Stealth Bot (Gerçek Site) Başlatılıyor...');
    
    // Tarayıcıyı arka planda (görünmez olarak) başlatıyoruz
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    
    // Gerçek bir kullanıcı gibi görünmek için ekran boyutu ayarlıyoruz
    await page.setViewport({ width: 1366, height: 768 });
    
    console.log(`📡 Hedef URL'ye gidiliyor (Büyük sitelerde güvenlik kontrolleri 5-10 saniye sürebilir): ${TARGET_URL}`);
    
    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('✅ Sayfa yüklendi. Ekran görüntüsü alınıyor...');
        
        // Ekran görüntüsünü data klasörüne kaydedelim
        const screenshotDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const screenshotPath = path.join(screenshotDir, 'trendyol_debug.png');
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`📸 Ekran görüntüsü kaydedildi: ${screenshotPath}`);

        // Sayfanın yüklenmesini tam beklemesi için biraz ekstra zaman tanıyalım
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Trendyol'un HTML yapısını inceleyip ürün kartlarını buluyoruz (Jenerik Yaklaşım)
        const products = await page.evaluate(() => {
            const items = [];
            
            // Sınıf (class) isimleri sürekli değiştiği için, daha akıllı bir yöntem kullanıyoruz:
            // Sayfadaki tüm linkleri (a etiketlerini) bul
            const links = document.querySelectorAll('a');
            
            links.forEach(link => {
                const img = link.querySelector('img');
                const text = link.innerText || '';
                
                // Eğer bir linkin içinde hem GÖRSEL varsa, hem de metninde "TL" geçiyorsa, bu büyük ihtimalle ürün kartıdır.
                if (img && (text.includes('TL') || text.includes('₺'))) {
                    // Metni satırlara böl (Trendyol'da genelde ilk satır marka, ikinci satır ürün adı, son satırlar fiyattır)
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    
                    let title = lines[0];
                    if (lines.length > 1 && !lines[1].includes('TL') && !lines[1].includes('₺')) {
                         title = lines[0] + ' ' + lines[1]; // Marka ve Modeli birleştir
                    }
                    
                    let priceText = lines.find(l => l.includes('TL') || l.includes('₺')) || '';

                    // Eğer başlık ve fiyat mantıklıysa listeye ekle
                    if (title && priceText && img.src.startsWith('http')) {
                        items.push({
                            title: title.substring(0, 100),
                            priceText: priceText,
                            image: img.src,
                            url: link.href,
                            vendor: 'Trendyol',
                            scrapedAt: new Date().toISOString()
                        });
                    }
                }
            });
            
            // Bazen aynı ürün iki kere görünebilir, aynı linkleri tekilleştirelim
            const uniqueItems = [];
            const urls = new Set();
            for (const item of items) {
                if (!urls.has(item.url)) {
                    urls.add(item.url);
                    uniqueItems.push(item);
                }
            }

            // Performans için ilk 20 ürünü alalım
            return uniqueItems.slice(0, 20);
        });

        console.log(`🔥 Başarılı! Toplam ${products.length} adet GERÇEK ürün çekildi.`);
        
        // Prisma ile veritabanına kaydetme / güncelleme işlemi
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        console.log('💾 Veriler veritabanına yazılıyor...');
        let addedOrUpdated = 0;
        for (const item of products) {
            // Fiyat metnini sıralama yapabilmek için gerçek sayıya dönüştürelim
            let numericPrice = 0;
            const match = item.priceText.match(/[\d.,]+/);
            if (match) {
                numericPrice = parseFloat(match[0].replace(/\./g, '').replace(',', '.'));
            }
            if (isNaN(numericPrice)) numericPrice = 0;

            await prisma.product.upsert({
                where: { url: item.url },
                update: {
                    price: numericPrice,
                    priceText: item.priceText,
                    updatedAt: new Date()
                },
                create: {
                    title: item.title,
                    price: numericPrice,
                    priceText: item.priceText,
                    image: item.image,
                    url: item.url,
                    vendor: item.vendor
                }
            });
            addedOrUpdated++;
        }
        await prisma.$disconnect();
        console.log(`✅ ${addedOrUpdated} ürün başarıyla veritabanına (Prisma/SQLite) işlendi!`);
        
    } catch (error) {
        console.error('❌ Bot çalışırken bir hata oluştu veya site bağlantıyı reddetti:', error.message);
    } finally {
        await browser.close();
    }
}

startRealScraping();
