#!/usr/bin/env node

/**
 * 🚀 SANA İYİ FİYAT — Amazon Turbo Scraper v2
 * 
 * Sadece Amazon'a odaklanır (Trendyol/HB engelliyor)
 * Daha hızlı, daha dayanıklı, daha fazla ürün
 * 
 * ÇALIŞTIRMAK İÇİN:
 *   node scripts/local-scraper.mjs
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import crypto from "crypto";

puppeteer.use(StealthPlugin());

const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const AFFILIATE_TAG = "sanaiyifiyat-21";
const BATCH_UPLOAD_SIZE = 50;
const PAGES_PER_TERM = 5; // Sayfa sayısını artırdık

// ==================== DEVASA ARAMA TERİMLERİ LİSTESİ (300+) ====================
const SEARCH_TERMS = [
  // === CEP TELEFONU (20) ===
  "iphone 15", "iphone 16", "samsung galaxy s24", "samsung galaxy a55",
  "xiaomi redmi note 13", "xiaomi 14", "oppo reno 12", "vivo v30",
  "realme 12 pro", "honor magic 6", "google pixel 8",
  "telefon kılıfı", "ekran koruyucu", "şarj kablosu", "şarj aleti",
  "kablosuz şarj", "araç telefon tutucu", "selfie çubuğu", "gimbal",
  "telefon tripod",

  // === LAPTOP & BİLGİSAYAR (25) ===
  "macbook air m3", "macbook pro m3", "lenovo ideapad", "lenovo thinkpad",
  "asus vivobook", "asus zenbook", "acer aspire", "dell inspiron",
  "hp pavilion", "hp envy", "msi katana", "monster laptop",
  "casper excalibur", "gaming laptop rtx", "chromebook",
  "masaüstü bilgisayar", "all in one bilgisayar", "mini pc",
  "bilgisayar kasası", "ram bellek", "işlemci", "ekran kartı",
  "anakart", "power supply", "bilgisayar fanı",

  // === TABLET (8) ===
  "ipad air", "ipad pro", "samsung galaxy tab s9", "samsung galaxy tab a9",
  "xiaomi pad 6", "lenovo tab", "tablet kılıfı", "tablet kalem",

  // === TV & GÖRÜNTÜ (15) ===
  "samsung smart tv", "lg oled tv", "sony bravia", "philips tv",
  "tcl tv", "55 inç tv", "65 inç tv", "75 inç tv",
  "4k monitör", "27 inç monitör", "32 inç monitör", "gaming monitör 144hz",
  "curved monitör", "taşınabilir monitör", "projeksiyon cihazı",

  // === SES & MÜZİK (20) ===
  "airpods pro", "samsung galaxy buds", "sony wh-1000xm5",
  "jbl tune", "jabra elite", "beats kulaklık", "anker soundcore",
  "marshall kulaklık", "bose kulaklık", "razer kulaklık",
  "jbl bluetooth hoparlör", "marshall hoparlör", "bose hoparlör",
  "harman kardon", "soundbar", "ev sinema sistemi",
  "mikrofon", "podcast mikrofon", "stüdyo mikrofon", "kablosuz mikrofon",

  // === AKILLI SAAT & GİYİLEBİLİR (10) ===
  "apple watch series 9", "apple watch ultra", "samsung galaxy watch 6",
  "huawei watch gt4", "xiaomi smart band 8", "garmin venu",
  "fitbit charge", "akıllı yüzük", "akıllı gözlük", "fitness bileklik",

  // === FOTOĞRAF & VİDEO (12) ===
  "canon eos r", "nikon z", "sony alpha", "fujifilm",
  "gopro hero", "dji osmo", "dji mini drone", "dji mavic",
  "aksiyon kamerası", "güvenlik kamerası", "bebek kamerası", "webcam",

  // === OYUN & KONSOL (15) ===
  "playstation 5 slim", "ps5 oyun", "ps5 dualsense",
  "xbox series x", "xbox game pass", "xbox controller",
  "nintendo switch oled", "nintendo oyun", "gaming bilgisayar",
  "gaming mouse", "gaming klavye", "gaming kulaklık",
  "gaming monitor", "oyun koltuğu", "gamepad",

  // === EV ALETLERİ - TEMİZLİK (15) ===
  "dyson v15", "dyson v12", "philips elektrikli süpürge",
  "bosch elektrikli süpürge", "arzum süpürge", "fakir süpürge",
  "roborock robot süpürge", "ecovacs robot süpürge", "xiaomi robot süpürge",
  "irobot roomba", "samsung jet", "karcher buharlı temizlik",
  "buharlı mop", "cam silme robotu", "elektrikli paspas",

  // === EV ALETLERİ - MUTFAK (25) ===
  "philips airfryer xxl", "tefal actifry", "xiaomi airfryer",
  "arzum airfryer", "nespresso kahve makinesi", "delonghi kahve makinesi",
  "philips espresso", "arzum okka", "çay makinesi", "arzum çaycı",
  "karaca çay makinesi", "blender", "nutribullet", "philips blender",
  "mutfak robotu", "el mikseri", "tost makinesi", "waffle makinesi",
  "ekmek yapma makinesi", "yoğurt makinesi", "su ısıtıcısı",
  "kettle", "termos", "bıçak seti", "tencere seti",

  // === EV ALETLERİ - BÜYÜK (15) ===
  "çamaşır makinesi", "kurutma makinesi", "bulaşık makinesi",
  "buzdolabı", "derin dondurucu", "mini buzdolabı",
  "split klima", "taşınabilir klima", "vantilatör",
  "ütü", "buharlı ütü merkezi", "dikey ütü",
  "ankastre fırın", "mikrodalga fırın", "indüksiyon ocak",

  // === GİYİM - ERKEK (20) ===
  "nike air force 1", "nike air max", "adidas superstar", "adidas ultraboost",
  "new balance 574", "new balance 530", "puma suede", "converse chuck taylor",
  "vans old skool", "erkek bot", "erkek klasik ayakkabı",
  "erkek mont", "erkek deri ceket", "erkek kazak", "erkek gömlek",
  "erkek takım elbise", "erkek kravat", "erkek cüzdan",
  "erkek kemer", "erkek güneş gözlüğü",

  // === GİYİM - KADIN (20) ===
  "kadın spor ayakkabı", "kadın topuklu", "kadın bot",
  "kadın çanta", "kadın sırt çantası", "kadın cüzdan",
  "kadın mont", "kadın trençkot", "kadın elbise",
  "kadın bluz", "kadın pantolon", "kadın etek",
  "kadın eşofman", "kadın pijama", "kadın mayo",
  "kadın güneş gözlüğü", "kadın saat", "kadın kolye",
  "kadın küpe", "kadın bileklik",

  // === PARFÜM & KOZMETİK (20) ===
  "erkek parfüm", "kadın parfüm", "dior sauvage", "chanel bleu",
  "yves saint laurent", "carolina herrera", "hugo boss",
  "cilt bakım seti", "yüz kremi", "güneş kremi", "serum",
  "fondöten", "ruj", "maskara", "göz kalemi",
  "makyaj seti", "oje seti", "parfüm seti",
  "şampuan", "saç bakım seti",

  // === SAĞLIK (15) ===
  "vitamin d", "omega 3", "multivitamin", "probiyotik",
  "whey protein", "bcaa", "kreatin", "protein bar",
  "tansiyon aleti", "şeker ölçüm", "pulse oksimetre",
  "elektrikli diş fırçası", "oral-b", "ağız duşu", "diş beyazlatma",

  // === BEBEK & ÇOCUK (15) ===
  "bebek arabası", "mama sandalyesi", "bebek yatağı",
  "bebek bezi pampers", "biberon", "emzik", "göğüs pompası",
  "bebek telsizi", "çocuk bisiklet", "çocuk tablet",
  "lego technic", "lego city", "barbie", "hot wheels", "puzzle 1000",

  // === SPOR & OUTDOOR (20) ===
  "koşu ayakkabısı", "spor ayakkabı erkek", "futbol ayakkabısı",
  "koşu bandı", "eliptik bisiklet", "kondisyon bisikleti",
  "dambıl seti", "ağırlık seti", "halter", "bench press",
  "yoga matı", "pilates topu", "direnç bandı",
  "bisiklet", "elektrikli scooter", "elektrikli bisiklet",
  "kamp çadırı", "uyku tulumu", "matara", "trekking ayakkabı",

  // === EV & DEKORASYON (15) ===
  "koltuk takımı", "köşe koltuk", "tv ünitesi",
  "yatak başlığı", "baza", "yatak", "yorgan",
  "nevresim takımı", "havlu seti", "halı",
  "perde", "avize", "abajur", "duvar saati", "ayna",

  // === BAHÇE & YAPI (10) ===
  "çim biçme makinesi", "budama makası", "bahçe hortumu",
  "bahçe mobilyası", "şemsiye", "barbekü",
  "matkap", "vidalama", "el aleti seti", "boya silindiri",

  // === OTOMOTİV (10) ===
  "yaz lastiği", "kış lastiği", "araç parfümü",
  "araç kamerası", "park sensörü", "oto müzik sistemi",
  "motor yağı", "akü", "oto yıkama makinesi", "oto koltuk kılıfı",

  // === EVCİL HAYVAN (8) ===
  "kedi maması", "köpek maması", "kedi kumu",
  "kedi tırmalama", "köpek tasma", "köpek yatağı",
  "akvaryum", "kuş kafesi",

  // === KİTAP & EĞİTİM (8) ===
  "çok satan kitaplar", "kişisel gelişim", "roman bestseller",
  "çocuk kitap seti", "ingilizce kitap", "sınav hazırlık",
  "e-kitap okuyucu", "kindle",
];

// ==================== YARDIMCI FONKSİYONLAR ====================

function generateEAN(input) { return crypto.createHash("md5").update(input).digest("hex").slice(0, 16); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function randomDelay(min, max) { return sleep(Math.floor(Math.random() * (max - min + 1)) + min); }
function formatPrice(price) { return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL"; }

function extractBrand(title) {
  const brands = ["Apple","Samsung","Xiaomi","Huawei","Oppo","Sony","LG","Philips","Dyson","Bosch","Siemens","Arçelik","Beko","Vestel","Nike","Adidas","Puma","New Balance","Converse","Vans","HP","Lenovo","Asus","Acer","Dell","MSI","Monster","Casper","Canon","Nikon","JBL","Marshall","Bose","Logitech","Razer","SteelSeries","Michelin","Bridgestone","Nespresso","DeLonghi","Tefal","Braun","PlayStation","Xbox","Nintendo","LEGO","Oral-B","Gillette","Dior","Chanel","Hugo Boss","Karaca","Arzum","Fakir","Roborock","iRobot"];
  for (const b of brands) { if (title.toLowerCase().includes(b.toLowerCase())) return b; }
  return title.split(" ")[0] || "";
}

function normalizeCategory(q) {
  const l = q.toLowerCase();
  if (/iphone|samsung.*tel|xiaomi|oppo|vivo|realme|telefon|galaxy s|galaxy a/.test(l)) return "cep-telefonu";
  if (/laptop|macbook|notebook|bilgisayar|pc|ram|işlemci|ekran kartı|anakart/.test(l)) return "bilgisayar";
  if (/ipad|tablet/.test(l)) return "tablet";
  if (/tv|televizyon|projeksiyon/.test(l)) return "televizyon";
  if (/monitör|monitor/.test(l)) return "monitor";
  if (/kulaklık|airpods|buds|headphone/.test(l)) return "kulaklik";
  if (/hoparlör|soundbar|speaker/.test(l)) return "hoparlor";
  if (/saat|watch|band|bileklik/.test(l)) return "akilli-saat";
  if (/kamera|gopro|webcam|drone/.test(l)) return "kamera";
  if (/playstation|ps5|xbox|nintendo|gaming|oyun|gamepad|konsol/.test(l)) return "oyun";
  if (/süpürge|çamaşır|bulaşık|klima|buzdolabı|fırın|ütü|vantilatör/.test(l)) return "ev-aletleri";
  if (/airfryer|kahve|çay|blender|mikser|tost|waffle|ekmek|kettle|tencere|bıçak/.test(l)) return "mutfak";
  if (/ayakkabı|bot|sneaker|nike|adidas|puma|new balance|converse|vans/.test(l)) return "ayakkabi";
  if (/çanta|cüzdan|kemer/.test(l)) return "canta-aksesuar";
  if (/mont|ceket|kazak|gömlek|takım|kravat|pantolon|elbise|etek|bluz|eşofman|pijama|mayo/.test(l)) return "giyim";
  if (/parfüm|dior|chanel|hugo/.test(l)) return "parfum";
  if (/cilt|krem|serum|güneş|fondöten|ruj|maskara|makyaj|oje/.test(l)) return "kozmetik";
  if (/şampuan|saç/.test(l)) return "sac-bakim";
  if (/vitamin|protein|omega|bcaa|kreatin/.test(l)) return "saglik";
  if (/diş|oral|ağız/.test(l)) return "kisisel-bakim";
  if (/bebek|mama|biberon|emzik|çocuk|lego|barbie|puzzle|oyuncak/.test(l)) return "anne-bebek";
  if (/bisiklet|koşu|spor|dambıl|yoga|pilates|fitness|scooter/.test(l)) return "spor";
  if (/kamp|outdoor|trekking/.test(l)) return "outdoor";
  if (/koltuk|yatak|yorgan|halı|perde|avize|masa|mobilya|dekorasyon/.test(l)) return "ev-yasam";
  if (/lastik|araç|oto|motor yağı|akü|park/.test(l)) return "otomotiv";
  if (/kedi|köpek|akvaryum|kuş/.test(l)) return "evcil-hayvan";
  if (/kitap|roman|kindle/.test(l)) return "kitap";
  if (/matkap|el aleti|boya|çim|bahçe|barbekü/.test(l)) return "bahce-yapi";
  if (/gözlük/.test(l)) return "aksesuar";
  if (/mikrofon/.test(l)) return "mikrofon";
  return "genel";
}

// ==================== AMAZON SCRAPER (Hata Toleranslı) ====================

async function scrapeAmazon(page, query, maxPages) {
  const products = [];

  for (let p = 1; p <= maxPages; p++) {
    try {
      const url = `https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}&page=${p}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await sleep(2000 + Math.random() * 1000);

      const items = await page.evaluate((tag) => {
        const results = [];
        document.querySelectorAll('[data-asin]').forEach((el) => {
          const asin = el.getAttribute("data-asin");
          if (!asin || asin.length < 5) return;
          const titleEl = el.querySelector("span.a-text-normal") || el.querySelector("h2 span");
          const title = titleEl?.textContent?.trim() || "";
          if (!title || title.length < 5) return;
          const pw = el.querySelector("span.a-price-whole")?.textContent?.replace(/[^0-9]/g, "") || "";
          if (!pw) return;
          const pf = el.querySelector("span.a-price-fraction")?.textContent?.replace(/[^0-9]/g, "") || "00";
          const price = parseFloat(`${pw}.${pf}`);
          if (!price || price <= 0) return;
          const image = el.querySelector("img.s-image")?.src || "";
          if (!image) return;
          const linkEl = el.querySelector("a.a-link-normal.s-no-outline") || el.querySelector("h2 a");
          let href = linkEl?.href || "";
          if (href && !href.includes("tag=")) href += (href.includes("?") ? "&" : "?") + `tag=${tag}`;
          results.push({ asin, title, price, image, url: href });
        });
        return results;
      }, AFFILIATE_TAG);

      for (const item of items) {
        products.push({
          ean: generateEAN(`amazon-${item.asin}`),
          title: item.title, image: item.image,
          category: normalizeCategory(query),
          brand: extractBrand(item.title),
          vendor: "Amazon", price: item.price,
          priceText: formatPrice(item.price), url: item.url,
        });
      }
      console.log(`  [Amazon] "${query}" s.${p}/${maxPages}: ${items.length} ürün`);
      await randomDelay(1500, 3000);
    } catch (err) {
      console.log(`  [Amazon] "${query}" s.${p} hata: ${err.message?.slice(0, 60)}`);
      if (err.message?.includes("ERR_CONNECTION") || err.message?.includes("503")) {
        await randomDelay(5000, 10000);
      }
    }
  }
  return products;
}

// ==================== UPLOAD ====================

async function uploadProducts(products) {
  if (!products.length) return;
  try {
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products, secretKey: SECRET_KEY }),
    });
    const data = await res.json();
    console.log(`  📤 ${data.message || "Yüklendi"}`);
    return data;
  } catch (e) { console.error(`  ❌ Upload hatası: ${e.message}`); }
}

// ==================== ANA FONKSİYON (v3 — Crash-Resistant) ====================

const RESTART_EVERY = 25; // Her 25 kategoride browser yeniden başlar

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "tr-TR,tr;q=0.9" });
  // Random user agent
  const agents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  ];
  await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)]);
  return { browser, page };
}

async function main() {
  console.log("🚀 SANA İYİ FİYAT — Amazon Turbo Scraper v3");
  console.log(`📊 ${SEARCH_TERMS.length} kategori x ${PAGES_PER_TERM} sayfa`);
  console.log(`🔄 Her ${RESTART_EVERY} kategoride browser yeniden başlatılır`);
  console.log("=".repeat(60));

  let totalProducts = 0;
  let totalUploaded = 0;
  let pendingProducts = [];
  let failedTerms = [];

  let { browser, page } = await launchBrowser();

  for (let i = 0; i < SEARCH_TERMS.length; i++) {
    const term = SEARCH_TERMS[i];
    const progress = Math.round(((i + 1) / SEARCH_TERMS.length) * 100);
    console.log(`\n🔍 [${i + 1}/${SEARCH_TERMS.length}] (${progress}%) "${term}"`);

    // Her RESTART_EVERY kategoride browser'ı yeniden başlat
    if (i > 0 && i % RESTART_EVERY === 0) {
      console.log(`\n🔄 Browser yeniden başlatılıyor (${i} kategori tamamlandı)...`);
      try { await browser.close(); } catch {}
      await sleep(3000);
      ({ browser, page } = await launchBrowser());
      console.log("✅ Yeni browser hazır!\n");
    }

    try {
      const products = await scrapeAmazon(page, term, PAGES_PER_TERM);
      totalProducts += products.length;
      pendingProducts.push(...products);
      console.log(`  📦 ${products.length} ürün çekildi | Toplam: ${totalProducts}`);
    } catch (err) {
      console.log(`  ⚠️ "${term}" hata: ${err.message?.slice(0, 80)}`);
      failedTerms.push(term);

      // Sayfa çökmüşse browser'ı yeniden başlat
      if (err.message?.includes("detached") || err.message?.includes("closed") || err.message?.includes("Target")) {
        console.log("  🔄 Browser çöktü, yeniden başlatılıyor...");
        try { await browser.close(); } catch {}
        await sleep(5000);
        ({ browser, page } = await launchBrowser());
        console.log("  ✅ Yeni browser hazır!");
      }
    }

    // Batch upload
    if (pendingProducts.length >= BATCH_UPLOAD_SIZE) {
      await uploadProducts(pendingProducts);
      totalUploaded += pendingProducts.length;
      pendingProducts = [];
    }

    // Her 50 kategoride durum raporu
    if ((i + 1) % 50 === 0) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📊 ARA RAPOR: ${i + 1}/${SEARCH_TERMS.length} kategori | ${totalProducts} ürün | ${totalUploaded} yüklendi`);
      console.log(`${"=".repeat(60)}\n`);
    }
  }

  // Kalan ürünleri yükle
  if (pendingProducts.length > 0) {
    await uploadProducts(pendingProducts);
    totalUploaded += pendingProducts.length;
  }

  try { await browser.close(); } catch {}

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 TAMAMLANDI!");
  console.log(`📊 Toplam çekilen: ${totalProducts} ürün`);
  console.log(`📤 Toplam yüklenen: ${totalUploaded} ürün`);
  console.log(`❌ Başarısız: ${failedTerms.length} kategori`);
  if (failedTerms.length) console.log(`   ${failedTerms.join(", ")}`);
  console.log("=".repeat(60));
}

main().catch(console.error);

