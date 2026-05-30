#!/usr/bin/env node

/**
 * 🚀 SANA İYİ FİYAT — Yerel Ürün Çekme Scripti
 * 
 * Bu script senin bilgisayarından çalışır, Puppeteer Stealth ile
 * gerçek bir Chrome tarayıcı açar ve ürünleri çeker.
 * 
 * ÇALIŞTIRMAK İÇİN:
 *   node scripts/local-scraper.mjs
 * 
 * Senin ev internet bağlantını kullandığı için Cloudflare seni engellemez!
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import crypto from "crypto";

// Stealth plugin — Cloudflare/bot korumasını aşar
puppeteer.use(StealthPlugin());

// ==================== AYARLAR ====================
const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const AFFILIATE_TAG = "sanaiyifiyat-21";
const BATCH_UPLOAD_SIZE = 50; // Her 50 üründe bir yükle

// ==================== ARAMA TERİMLERİ ====================
const SEARCH_TERMS = [
  // Elektronik (En Çok Arananlar)
  "iphone", "samsung telefon", "xiaomi telefon", "oppo telefon",
  "laptop", "gaming laptop", "macbook", "lenovo laptop", "asus laptop",
  "tablet", "ipad", "samsung tablet",
  "televizyon", "smart tv", "4k tv",
  "kulaklık", "bluetooth kulaklık", "airpods",
  "akıllı saat", "apple watch",
  "powerbank", "şarj aleti",
  "monitor", "gaming monitor",
  "klavye", "mouse", "gaming mouse",
  "kamera", "güvenlik kamera", "drone",
  "hoparlör", "bluetooth hoparlör", "soundbar",
  "hard disk", "ssd", "flash bellek",
  
  // Ev Aletleri
  "elektrikli süpürge", "robot süpürge",
  "çamaşır makinesi", "bulaşık makinesi",
  "klima", "buzdolabı",
  "airfryer", "fırın", "mikrodalga",
  "kahve makinesi", "çay makinesi",
  "blender", "ütü", "tost makinesi",
  
  // Moda
  "erkek ayakkabı", "kadın ayakkabı", "spor ayakkabı",
  "nike ayakkabı", "adidas ayakkabı",
  "erkek çanta", "kadın çanta",
  "kol saati", "güneş gözlüğü",
  "erkek parfüm", "kadın parfüm",
  "mont", "kazak", "gömlek", "tişört",
  "elbise", "pantolon", "jean",
  
  // Bebek & Çocuk
  "bebek arabası", "oyuncak", "lego",
  "bebek bezi",
  
  // Spor
  "bisiklet", "koşu bandı", "dambıl",
  "spor çanta",
  
  // Oto
  "lastik", "araç kamera", "telefon tutucu",
  
  // Kozmetik
  "cilt bakımı", "şampuan", "makyaj",
  "parfüm", "diş fırçası",
  
  // Ev & Yaşam
  "yatak", "yorgan", "yastık",
  "halı", "perde", "avize",
  "tencere seti", "masa",
  
  // Gaming
  "playstation 5", "xbox", "nintendo switch",
  "gaming laptop", "oyun koltuğu",
  
  // Evcil Hayvan
  "kedi maması", "köpek maması",
];

// ==================== YARDIMCI FONKSİYONLAR ====================

function generateEAN(input) {
  return crypto.createHash("md5").update(input).digest("hex").slice(0, 16);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(min, max) {
  return sleep(Math.floor(Math.random() * (max - min + 1)) + min);
}

function formatPrice(price) {
  return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";
}

function extractBrand(title) {
  const brands = [
    "Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Sony", "LG",
    "Philips", "Dyson", "Bosch", "Siemens", "Arçelik", "Beko", "Vestel",
    "Nike", "Adidas", "Puma", "New Balance", "HP", "Lenovo", "Asus",
    "Acer", "Dell", "MSI", "Monster", "Canon", "JBL", "Logitech",
    "Razer", "Michelin", "Nespresso", "Tefal", "Braun", "PlayStation",
    "Xbox", "Nintendo", "LEGO", "Oral-B", "Gillette",
  ];
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) return brand;
  }
  return title.split(" ")[0] || "";
}

function normalizeCategory(query) {
  const q = query.toLowerCase();
  if (q.includes("telefon") || q.includes("iphone") || q.includes("samsung")) return "cep-telefonu";
  if (q.includes("laptop") || q.includes("macbook") || q.includes("bilgisayar")) return "bilgisayar";
  if (q.includes("tablet") || q.includes("ipad")) return "tablet";
  if (q.includes("tv") || q.includes("televizyon")) return "televizyon";
  if (q.includes("kulaklık") || q.includes("airpods")) return "kulaklik";
  if (q.includes("saat") || q.includes("watch")) return "akilli-saat";
  if (q.includes("süpürge") || q.includes("çamaşır") || q.includes("bulaşık") || q.includes("klima") || q.includes("buzdolabı") || q.includes("airfryer") || q.includes("fırın") || q.includes("kahve") || q.includes("çay") || q.includes("blender") || q.includes("ütü") || q.includes("tost")) return "ev-aletleri";
  if (q.includes("ayakkabı") || q.includes("çanta") || q.includes("mont") || q.includes("kazak") || q.includes("gömlek") || q.includes("elbise") || q.includes("pantolon") || q.includes("jean") || q.includes("tişört") || q.includes("gözlük")) return "giyim";
  if (q.includes("parfüm") || q.includes("makyaj") || q.includes("cilt") || q.includes("şampuan")) return "kozmetik";
  if (q.includes("bebek") || q.includes("oyuncak") || q.includes("lego")) return "anne-bebek";
  if (q.includes("bisiklet") || q.includes("koşu") || q.includes("dambıl") || q.includes("spor")) return "spor";
  if (q.includes("lastik") || q.includes("araç") || q.includes("oto")) return "oto-sanayi";
  if (q.includes("yatak") || q.includes("yorgan") || q.includes("halı") || q.includes("perde") || q.includes("masa") || q.includes("tencere")) return "ev-yasam";
  if (q.includes("playstation") || q.includes("xbox") || q.includes("nintendo") || q.includes("gaming") || q.includes("oyun")) return "oyun";
  if (q.includes("kedi") || q.includes("köpek")) return "evcil-hayvan";
  if (q.includes("monitor") || q.includes("klavye") || q.includes("mouse") || q.includes("hard disk") || q.includes("ssd")) return "bilgisayar";
  if (q.includes("hoparlör") || q.includes("soundbar") || q.includes("mikrofon")) return "elektronik";
  if (q.includes("kamera") || q.includes("drone")) return "elektronik";
  return "genel";
}

// ==================== AMAZON SCRAPER ====================

async function scrapeAmazon(browser, query, pages = 3) {
  const products = [];
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1366, height: 768 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "tr-TR,tr;q=0.9" });

    for (let p = 1; p <= pages; p++) {
      const url = `https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}&page=${p}`;
      
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(2000);

        const items = await page.evaluate((affiliateTag) => {
          const results = [];
          document.querySelectorAll('[data-asin]').forEach((el) => {
            const asin = el.getAttribute("data-asin");
            if (!asin || asin.length < 5) return;

            const titleEl = el.querySelector("span.a-text-normal") || el.querySelector("h2 span");
            const title = titleEl?.textContent?.trim() || "";
            if (!title || title.length < 5) return;

            const priceWhole = el.querySelector("span.a-price-whole")?.textContent?.replace(/[^0-9]/g, "") || "";
            if (!priceWhole) return;
            const priceFrac = el.querySelector("span.a-price-fraction")?.textContent?.replace(/[^0-9]/g, "") || "00";
            const price = parseFloat(`${priceWhole}.${priceFrac}`);
            if (!price || price <= 0) return;

            const image = el.querySelector("img.s-image")?.src || "";
            if (!image) return;

            const linkEl = el.querySelector("a.a-link-normal.s-no-outline") || el.querySelector("h2 a") || el.querySelector('a[href*="/dp/"]');
            let href = linkEl?.href || "";
            if (href && !href.includes("tag=")) {
              href += (href.includes("?") ? "&" : "?") + `tag=${affiliateTag}`;
            }

            results.push({ asin, title, price, image, url: href });
          });
          return results;
        }, AFFILIATE_TAG);

        for (const item of items) {
          products.push({
            ean: generateEAN(`amazon-${item.asin}`),
            title: item.title,
            image: item.image,
            category: normalizeCategory(query),
            brand: extractBrand(item.title),
            vendor: "Amazon",
            price: item.price,
            priceText: formatPrice(item.price),
            url: item.url,
          });
        }

        console.log(`  [Amazon] "${query}" sayfa ${p}/${pages}: ${items.length} ürün (toplam: ${products.length})`);
        await randomDelay(1500, 3000);
      } catch (err) {
        console.log(`  [Amazon] "${query}" sayfa ${p} hata: ${err.message}`);
        break;
      }
    }
  } catch (err) {
    console.error(`  [Amazon] Genel hata: ${err.message}`);
  } finally {
    await page.close();
  }

  return products;
}

// ==================== TRENDYOL SCRAPER ====================

async function scrapeTrendyol(browser, query, pages = 3) {
  const products = [];
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1366, height: 768 });

    for (let p = 1; p <= pages; p++) {
      const url = `https://www.trendyol.com/sr?q=${encodeURIComponent(query)}&pi=${p}`;
      
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(3000);

        // Sayfayı scroll et ki lazy load resimler yüklensin
        await page.evaluate(() => window.scrollBy(0, 2000));
        await sleep(1000);
        await page.evaluate(() => window.scrollBy(0, 4000));
        await sleep(1000);

        const items = await page.evaluate(() => {
          const results = [];
          document.querySelectorAll('.p-card-wrppr').forEach((el) => {
            try {
              const titleEl = el.querySelector('.prdct-desc-cntnr-name') || el.querySelector('span[class*="prdct-desc"]');
              const title = titleEl?.textContent?.trim() || "";
              if (!title) return;

              const priceEl = el.querySelector('.prc-box-dscntd') || el.querySelector('.prc-box-sllng');
              let priceText = priceEl?.textContent?.trim() || "";
              const price = parseFloat(priceText.replace(/[^0-9,]/g, "").replace(",", "."));
              if (!price || price <= 0) return;

              const image = el.querySelector('img')?.src || el.querySelector('img')?.getAttribute('data-src') || "";
              
              const linkEl = el.querySelector('a');
              const href = linkEl?.href || "";

              const brandEl = el.querySelector('.prdct-desc-cntnr-ttl') || el.querySelector('span[class*="prdct-desc-cntnr-ttl"]');
              const brand = brandEl?.textContent?.trim() || "";

              results.push({ title, price, image, url: href, brand });
            } catch {}
          });
          return results;
        });

        for (const item of items) {
          products.push({
            ean: generateEAN(`trendyol-${item.url}`),
            title: item.title,
            image: item.image,
            category: normalizeCategory(query),
            brand: item.brand || extractBrand(item.title),
            vendor: "Trendyol",
            price: item.price,
            priceText: formatPrice(item.price),
            url: item.url,
          });
        }

        console.log(`  [Trendyol] "${query}" sayfa ${p}/${pages}: ${items.length} ürün (toplam: ${products.length})`);
        await randomDelay(2000, 4000);
      } catch (err) {
        console.log(`  [Trendyol] "${query}" sayfa ${p} hata: ${err.message}`);
        break;
      }
    }
  } catch (err) {
    console.error(`  [Trendyol] Genel hata: ${err.message}`);
  } finally {
    await page.close();
  }

  return products;
}

// ==================== HEPSIBURADA SCRAPER ====================

async function scrapeHepsiburada(browser, query, pages = 3) {
  const products = [];
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1366, height: 768 });

    for (let p = 1; p <= pages; p++) {
      const url = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(query)}&sayfa=${p}`;
      
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(3000);

        await page.evaluate(() => window.scrollBy(0, 2000));
        await sleep(1000);

        const items = await page.evaluate(() => {
          const results = [];
          // Hepsiburada product cards
          const selectors = [
            '[data-test-id="product-card-item"]',
            'li[class*="productListContent"]',
            '.search-item',
          ];
          
          let cards = [];
          for (const sel of selectors) {
            cards = document.querySelectorAll(sel);
            if (cards.length > 0) break;
          }

          cards.forEach((el) => {
            try {
              const titleEl = el.querySelector('[data-test-id="product-card-name"]') || el.querySelector('h3') || el.querySelector('span[class*="product"]');
              const title = titleEl?.textContent?.trim() || "";
              if (!title) return;

              const priceEl = el.querySelector('[data-test-id="price-current-price"]') || el.querySelector('[class*="price"]');
              let priceText = priceEl?.textContent?.trim() || "";
              const price = parseFloat(priceText.replace(/[^0-9,]/g, "").replace(",", "."));
              if (!price || price <= 0) return;

              const image = el.querySelector('img')?.src || el.querySelector('img')?.getAttribute('data-src') || "";
              const linkEl = el.querySelector('a');
              const href = linkEl?.href || "";

              results.push({ title, price, image, url: href });
            } catch {}
          });
          return results;
        });

        for (const item of items) {
          products.push({
            ean: generateEAN(`hb-${item.url}`),
            title: item.title,
            image: item.image,
            category: normalizeCategory(query),
            brand: extractBrand(item.title),
            vendor: "Hepsiburada",
            price: item.price,
            priceText: formatPrice(item.price),
            url: item.url,
          });
        }

        console.log(`  [Hepsiburada] "${query}" sayfa ${p}/${pages}: ${items.length} ürün (toplam: ${products.length})`);
        await randomDelay(2000, 4000);
      } catch (err) {
        console.log(`  [Hepsiburada] "${query}" sayfa ${p} hata: ${err.message}`);
        break;
      }
    }
  } catch (err) {
    console.error(`  [Hepsiburada] Genel hata: ${err.message}`);
  } finally {
    await page.close();
  }

  return products;
}

// ==================== UPLOAD FONKSİYONU ====================

async function uploadProducts(products) {
  if (products.length === 0) return;

  try {
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products,
        secretKey: SECRET_KEY,
      }),
    });

    const result = await response.json();
    console.log(`  📤 Yükleme: ${result.message || JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.error(`  ❌ Yükleme hatası: ${err.message}`);
  }
}

// ==================== ANA FONKSİYON ====================

async function main() {
  console.log("🚀 SANA İYİ FİYAT — Ürün Çekme Botu Başlatılıyor...");
  console.log(`📊 Toplam ${SEARCH_TERMS.length} kategori taranacak`);
  console.log("=".repeat(60));

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1366,768",
    ],
  });

  let totalProducts = 0;
  let totalUploaded = 0;
  let pendingProducts = [];

  for (let i = 0; i < SEARCH_TERMS.length; i++) {
    const term = SEARCH_TERMS[i];
    console.log(`\n🔍 [${i + 1}/${SEARCH_TERMS.length}] "${term}" taranıyor...`);

    // Her kaynaktan çek
    const amazonProducts = await scrapeAmazon(browser, term, 2);
    const trendyolProducts = await scrapeTrendyol(browser, term, 2);
    const hepsiburadaProducts = await scrapeHepsiburada(browser, term, 2);

    const allProducts = [...amazonProducts, ...trendyolProducts, ...hepsiburadaProducts];
    totalProducts += allProducts.length;
    pendingProducts.push(...allProducts);

    console.log(`  📦 Toplam: Amazon(${amazonProducts.length}) + Trendyol(${trendyolProducts.length}) + HB(${hepsiburadaProducts.length}) = ${allProducts.length} ürün`);

    // Batch upload
    if (pendingProducts.length >= BATCH_UPLOAD_SIZE) {
      await uploadProducts(pendingProducts);
      totalUploaded += pendingProducts.length;
      pendingProducts = [];
    }

    // İlerleme raporu
    const progress = Math.round(((i + 1) / SEARCH_TERMS.length) * 100);
    console.log(`  📈 İlerleme: ${progress}% | Toplam çekilen: ${totalProducts} | Yüklenen: ${totalUploaded}`);
  }

  // Kalan ürünleri yükle
  if (pendingProducts.length > 0) {
    await uploadProducts(pendingProducts);
    totalUploaded += pendingProducts.length;
  }

  await browser.close();

  console.log("\n" + "=".repeat(60));
  console.log("🎉 TAMAMLANDI!");
  console.log(`📊 Toplam çekilen: ${totalProducts} ürün`);
  console.log(`📤 Toplam yüklenen: ${totalUploaded} ürün`);
  console.log("=".repeat(60));
}

main().catch(console.error);
