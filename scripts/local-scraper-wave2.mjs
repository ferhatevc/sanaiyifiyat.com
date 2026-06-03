#!/usr/bin/env node

/**
 * 🚀 SANA İYİ FİYAT — Amazon Turbo Scraper v3 (WAVE 2)
 * Yeni arama terimleri — öncekilerden FARKLI ürünler çekecek
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import crypto from "crypto";

puppeteer.use(StealthPlugin());

const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const AFFILIATE_TAG = "sanaiyifiyat-21";
const BATCH_UPLOAD_SIZE = 50;
const PAGES_PER_TERM = 5;
const RESTART_EVERY = 25;

// ==================== WAVE 2 — FARKLI TERİMLER (350+) ====================
const SEARCH_TERMS = [
  // === TEKNOLOJİ DETAY ===
  "iphone 16 pro max kılıf", "samsung s24 ultra kılıf", "iphone şarj kablosu",
  "usb c hub", "hdmi kablo", "usb bellek 128gb", "sd kart 256gb",
  "harici disk 1tb", "ssd 1tb", "nvme ssd", "thunderbolt dock",
  "laptop çantası", "laptop soğutucu", "laptop standı", "mekanik klavye",
  "kablosuz mouse", "ergonomik mouse", "mouse pad", "webcam 4k",
  "usb mikrofon", "ring light", "led panel ışık", "tripod", "gimbal stabilizer",

  // === EV ELEKTRONİK ===
  "akıllı priz", "akıllı ampul", "akıllı ev", "google home", "alexa echo",
  "wi-fi router", "mesh wifi", "ethernet switch", "powerbank 20000",
  "powerbank 30000", "ups kesintisiz güç", "voltaj regülatörü", "uzatma kablosu",
  "pil şarj cihazı", "aa pil", "lityum pil", "güneş enerjisi şarj",

  // === MOBİL AKSESUAR ===
  "apple pencil", "ipad klavye", "tablet standı", "araç şarj", "araç tutucu manyetik",
  "pop socket", "telefon bileklik", "waterproof telefon kılıfı", "kamera lens telefon",
  "bluetooth tracker", "airtag", "smarttag",

  // === YAZICI & OFİS ===
  "yazıcı", "lazer yazıcı", "mürekkep kartuş", "fotokopi makinesi",
  "tarayıcı", "etiket yazıcı", "laminasyon makinesi", "kağıt imha makinesi",
  "ofis sandalyesi", "çalışma masası", "monitor kolu", "laptop yükseltici",

  // === KAMERA AKSESUAR ===
  "kamera çantası", "kamera tripod", "kamera kayış", "lens filtre",
  "hafıza kartı kamera", "kamera pili", "reflektör", "softbox",
  "video ışık", "green screen", "gimbal kamera", "drone batarya",

  // === SES EKİPMANI ===
  "stüdyo monitörü", "ses kartı", "mikser", "pop filter",
  "mikrofon standı", "boom arm", "akustik panel", "dj controller",
  "plak çalar", "pikap iğnesi", "karaoke mikrofon", "amplifikatör",
  "subwoofer", "tavan hoparlörü", "radyo", "fm verici",

  // === OYUN AKSESUAR ===
  "ps5 ssd", "ps5 kulaklık", "ps5 şarj istasyonu", "ps5 koruma",
  "xbox elite controller", "nintendo pro controller", "joy-con",
  "oyun masası", "mouse bungee", "joystick", "direksiyon seti",
  "vr gözlük", "meta quest 3", "oyun konsolu", "retro konsol",

  // === SAAT & AKSESUAR ===
  "erkek kol saati", "kadın kol saati", "casio saat", "fossil saat",
  "daniel wellington", "swatch saat", "akıllı saat kordon", "saat kutusu",
  "saat kayışı", "kol düğmesi", "kravat iğnesi", "erkek bileklik",

  // === GÖZLÜK ===
  "ray ban güneş gözlüğü", "polarize güneş gözlüğü", "spor gözlük",
  "mavi ışık filtreli gözlük", "okuma gözlüğü", "gözlük kılıfı",

  // === ÇANTA & VALIZ ===
  "seyahat valizi", "kabin boy valiz", "sırt çantası laptop",
  "okul çantası", "spor çanta", "bel çantası", "çapraz çanta",
  "plaj çantası", "makyaj çantası", "evrak çantası", "valiz seti",

  // === AYAKKABI DETAY ===
  "nike dunk low", "adidas samba", "adidas gazelle", "nike pegasus",
  "asics gel kayano", "salomon ayakkabı", "timberland bot",
  "dr martens", "birkenstock", "crocs", "terlik", "sandalet",
  "krampon", "halı saha ayakkabısı", "boks ayakkabısı",

  // === SPOR GİYİM ===
  "nike tayt", "adidas eşofman", "under armour tişört", "puma forma",
  "spor sütyeni", "koşu şort", "yağmurluk", "rüzgarlık",
  "kayak montu", "kayak pantolonu", "termal iç giyim", "outdoor ceket",

  // === SPOR EKİPMAN DETAY ===
  "kettlebell", "battle rope", "trx seti", "smith makinesi",
  "çekme barı", "paralel bar", "atlama ipi", "boks eldiveni",
  "boks torbası", "kicking pad", "jimnastik minderi", "denge tahtası",
  "foam roller", "masaj tabancası", "masaj aleti", "tens cihazı",

  // === BİSİKLET & SCOOTER ===
  "dağ bisikleti", "yol bisikleti", "şehir bisikleti", "katlanır bisiklet",
  "bisiklet kaskı", "bisiklet lambası", "bisiklet kilidi", "bisiklet pompası",
  "bisiklet kadro çantası", "bisiklet gözlüğü", "scooter kaskı",
  "scooter aksesuar", "paten", "kaykay",

  // === KAMP & OUTDOOR DETAY ===
  "kamp ocağı", "kamp lambası", "kamp sandalyesi", "kamp masası",
  "termos çelik", "matara paslanmaz", "çakı", "swiss army knife",
  "pusula", "dürbün", "teleskop", "gece görüş", "el feneri",
  "kafa lambası", "survival kit", "ilk yardım çantası",

  // === BAHÇE DETAY ===
  "çim tohumu", "saksı", "bahçe makası", "çit makası",
  "basınçlı yıkama", "su pompası", "bahçe aydınlatma", "güneş enerjili lamba",
  "hamak", "bahçe salıncağı", "mangal", "kömür", "piknik seti",

  // === MUTFAK DETAY ===
  "döküm tava", "teflon tava", "wok tava", "granit tencere seti",
  "düdüklü tencere", "pizza taşı", "fırın tepsisi", "silikon kalıp",
  "hamur yoğurma makinesi", "makarna makinesi", "soda makinesi",
  "su arıtma", "su filtresi", "buz makinesi", "vakum makinesi",
  "gıda kurutma makinesi", "meyve sıkacağı", "narenciye sıkacağı",
  "türk kahve makinesi", "french press", "chemex", "v60",
  "kahve değirmeni", "espresso bardağı", "çay bardağı seti",

  // === BANYO & KİŞİSEL BAKIM ===
  "saç kurutma makinesi", "dyson airwrap", "saç düzleştirici", "saç maşası",
  "saç kesme makinesi", "sakal tıraş makinesi", "epilatör",
  "ipl epilasyon", "yüz temizleme cihazı", "dermaroller",
  "tartı baskül", "vücut analiz tartısı", "banyo seti",
  "havlu askısı", "duş başlığı", "banyo paspası",

  // === PARFÜM DETAY ===
  "tom ford parfüm", "versace parfüm", "armani parfüm", "burberry parfüm",
  "dolce gabbana", "gucci parfüm", "prada parfüm", "narciso rodriguez",
  "jo malone", "attar collection", "lattafa parfüm", "oud parfüm",
  "oto kokusu", "ev parfümü", "çubuklu oda kokusu",

  // === CİLT BAKIM DETAY ===
  "retinol serum", "c vitamini serum", "hyaluronik asit", "niacinamide",
  "aha bha peeling", "göz altı kremi", "anti aging krem", "nemlendirici",
  "temizleme köpüğü", "misel su", "yüz maskesi", "kil maskesi",
  "dudak bakım", "el kremi", "vücut losyonu", "selülit kremi",

  // === SAÇ BAKIM DETAY ===
  "kerastase şampuan", "loreal saç boyası", "saç spreyi", "saç köpüğü",
  "saç kremi", "saç maskesi", "saç vitamini", "biotin", "keratin bakım",
  "saç dökülmesi", "minoxidil", "saç serumu",

  // === BEBEK DETAY ===
  "bebek puset", "oto koltuğu bebek", "kanguru bebek", "bebek salıncağı",
  "bebek banyo küveti", "bebek bakım seti", "bebek tırnak makası",
  "anne sütü saklama", "mama önlüğü", "alıştırma bardağı",
  "bebek güneş kremi", "pişik kremi", "bebek şampuanı", "bebek deterjani",
  "oyun parkı", "yürüteç", "montessori oyuncak",

  // === OYUNCAK DETAY ===
  "lego star wars", "lego harry potter", "lego creator", "lego friends",
  "playmobil", "nerf silah", "remote control araba", "drone oyuncak",
  "slime", "play doh", "crayola", "rubik küp", "zeka oyunu",
  "kutu oyunu", "monopoly", "uno", "jenga", "satranç takımı",

  // === KIRTASİYE ===
  "planner ajanda", "bullet journal", "dolma kalem", "tükenmez kalem seti",
  "marker kalem", "boya kalemi seti", "sulu boya", "yağlı boya",
  "çizim tableti", "grafik tablet", "wacom tablet",

  // === EVCİL HAYVAN DETAY ===
  "kedi mama kabı otomatik", "köpek tasma kayış", "kedi oyuncak",
  "kedi tüneli", "köpek yağmurluk", "köpek eğitim", "kedi çimi",
  "akvaryum filtre", "akvaryum aydınlatma", "balık yemi",
  "kuş yemi", "hamster kafesi", "kaplumbağa havuzu",

  // === OTOMOTİV DETAY ===
  "araç içi kamera", "dashcam", "geri görüş kamerası",
  "araç buzdolabı", "araç süpürge", "araç cilası", "nano kaplama",
  "jant temizleyici", "torpido parfümü", "araç organizer",
  "direksiyon kılıfı", "araç perde", "çocuk koltuğu araç",
  "kar zinciri", "takviye kablosu", "kompresör", "lastik tamir seti",

  // === YAPI & HIRDAVAT ===
  "akülü matkap", "darbeli matkap", "şarjlı vidalama", "dekupaj testere",
  "daire testere", "taşlama makinesi", "kaynak makinesi", "hava tabancası",
  "lazer metre", "su terazisi", "pense seti", "tornavida seti",
  "ingiliz anahtarı", "alyan anahtar", "elektrik tester",

  // === MOBİLYA DETAY ===
  "bilgisayar masası", "kitaplık", "gardrop", "komodin",
  "tv sehpası", "konsol", "ayakkabılık", "portmanto",
  "raf sistemi", "duvar rafı", "banyo dolabı", "mutfak dolabı",

  // === AYDINLATMA ===
  "led şerit", "rgb led şerit", "akıllı led", "masa lambası",
  "klips lamba", "gece lambası", "tavan lambası", "sarkıt lamba",
  "aplik", "bahçe lambası", "solar lamba", "projektör",
];

// ==================== YARDIMCI FONKSİYONLAR ====================
function generateEAN(input) { return crypto.createHash("md5").update(input).digest("hex").slice(0, 16); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function randomDelay(min, max) { return sleep(Math.floor(Math.random() * (max - min + 1)) + min); }
function formatPrice(price) { return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL"; }

function extractBrand(title) {
  const brands = ["Apple","Samsung","Xiaomi","Huawei","Oppo","Sony","LG","Philips","Dyson","Bosch","Siemens","Arçelik","Beko","Vestel","Nike","Adidas","Puma","New Balance","Converse","Vans","HP","Lenovo","Asus","Acer","Dell","MSI","Monster","Casper","Canon","Nikon","JBL","Marshall","Bose","Logitech","Razer","SteelSeries","Nespresso","DeLonghi","Tefal","Braun","PlayStation","Xbox","Nintendo","LEGO","Oral-B","Dior","Chanel","Hugo Boss","Karaca","Arzum","Fakir","Roborock","iRobot","Tom Ford","Versace","Gucci","Prada","Ray-Ban","Casio","Fossil","Wacom","Under Armour","Salomon","Timberland","Dr. Martens","Birkenstock","Crocs","ASICS","Kérastase","L'Oreal"];
  for (const b of brands) { if (title.toLowerCase().includes(b.toLowerCase())) return b; }
  return title.split(" ")[0] || "";
}

function normalizeCategory(q) {
  const l = q.toLowerCase();
  if (/iphone|samsung.*kılıf|telefon|şarj.*kablo|pop socket/.test(l)) return "cep-telefonu";
  if (/laptop|macbook|bilgisayar|ssd|nvme|ram|klavye|mouse|dock|hub|usb|hdmi/.test(l)) return "bilgisayar";
  if (/ipad|tablet|apple pencil/.test(l)) return "tablet";
  if (/tv|televizyon|projeksiyon|projektör/.test(l)) return "televizyon";
  if (/monitör|monitor/.test(l)) return "monitor";
  if (/kulaklık|airpods|buds|headphone/.test(l)) return "kulaklik";
  if (/hoparlör|soundbar|speaker|amplifikatör|subwoofer/.test(l)) return "hoparlor";
  if (/saat|watch|band|bileklik|casio|fossil/.test(l)) return "akilli-saat";
  if (/kamera|gopro|webcam|drone|lens|tripod|gimbal/.test(l)) return "kamera";
  if (/playstation|ps5|xbox|nintendo|gaming|oyun|gamepad|konsol|vr|quest/.test(l)) return "oyun";
  if (/süpürge|çamaşır|bulaşık|klima|buzdolabı|fırın|ütü|vantilatör|ups|router|wifi/.test(l)) return "ev-aletleri";
  if (/airfryer|kahve|çay|blender|mikser|tost|waffle|ekmek|kettle|tencere|bıçak|tava|fırın|makarna|soda|arıtma|buz|vakum|kurutma|sıkacağı|french press|chemex|v60|değirmen|düdüklü/.test(l)) return "mutfak";
  if (/ayakkabı|bot|sneaker|nike|adidas|puma|new balance|converse|vans|dunk|samba|gazelle|crocs|terlik|sandalet|krampon|timberland|birkenstock|salomon|asics|dr.martens/.test(l)) return "ayakkabi";
  if (/çanta|cüzdan|kemer|valiz|sırt çantası|evrak/.test(l)) return "canta-aksesuar";
  if (/mont|ceket|kazak|gömlek|takım|kravat|pantolon|elbise|etek|bluz|eşofman|pijama|mayo|tayt|şort|rüzgarlık|yağmurluk|termal/.test(l)) return "giyim";
  if (/parfüm|dior|chanel|hugo|tom ford|versace|gucci|prada|narciso|lattafa|oud|koku/.test(l)) return "parfum";
  if (/cilt|krem|serum|güneş|fondöten|ruj|maskara|makyaj|oje|retinol|hyaluronik|niacinamide|peeling|nemlendirici|misel/.test(l)) return "kozmetik";
  if (/şampuan|saç|keratin|biotin|minoxidil/.test(l)) return "sac-bakim";
  if (/vitamin|protein|omega|bcaa|kreatin/.test(l)) return "saglik";
  if (/diş|oral|ağız|epilat|tıraş|saç kurutma|düzleştirici|maşa|tartı|baskül/.test(l)) return "kisisel-bakim";
  if (/bebek|mama|biberon|emzik|çocuk|puset|oto koltuğu|kanguru|yürüteç|montessori|pişik/.test(l)) return "anne-bebek";
  if (/lego|playmobil|nerf|oyuncak|slime|play doh|rubik|kutu oyunu|monopoly|uno|jenga|satranç|puzzle/.test(l)) return "oyuncak";
  if (/bisiklet|koşu|spor|dambıl|yoga|pilates|fitness|scooter|kettlebell|trx|boks|paten|kaykay/.test(l)) return "spor";
  if (/kamp|outdoor|trekking|dürbün|teleskop|pusula|survival|çakı|fener/.test(l)) return "outdoor";
  if (/koltuk|yatak|yorgan|halı|perde|avize|masa|mobilya|dekorasyon|kitaplık|gardrop|raf|portmanto|komodin/.test(l)) return "ev-yasam";
  if (/led|lamba|aydınlatma|aplik|sarkıt|projektör|solar/.test(l)) return "aydinlatma";
  if (/lastik|araç|oto|motor yağı|akü|park|dashcam|direksiyon|jant|kompresör|kar zinciri/.test(l)) return "otomotiv";
  if (/kedi|köpek|akvaryum|kuş|hamster|kaplumbağa|balık/.test(l)) return "evcil-hayvan";
  if (/kitap|roman|kindle|ajanda|kalem|boya|tablet.*çizim|wacom|grafik/.test(l)) return "kirtasiye";
  if (/gözlük|ray.ban|polarize/.test(l)) return "aksesuar";
  if (/mikrofon|mikser|ses kartı|akustik/.test(l)) return "ses-ekipman";
  if (/matkap|testere|taşlama|kaynak|pense|tornavida|anahtar|tester/.test(l)) return "yapi-hirdavat";
  if (/yazıcı|kartuş|tarayıcı|etiket|laminasyon|kağıt imha/.test(l)) return "ofis";
  if (/ring light|led panel|softbox|green screen|reflektör/.test(l)) return "foto-ekipman";
  if (/powerbank|pil|güneş enerjisi|akıllı priz|akıllı ampul|akıllı ev|alexa|google home/.test(l)) return "akilli-ev";
  if (/masaj|foam roller|tens/.test(l)) return "saglik";
  if (/mangal|bahçe|çim|saksı|hamak/.test(l)) return "bahce";
  return "genel";
}

// ==================== AMAZON SCRAPER ====================
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
          ean: generateEAN(`amazon-${item.asin}`), title: item.title, image: item.image,
          category: normalizeCategory(query), brand: extractBrand(item.title),
          vendor: "Amazon", price: item.price, priceText: formatPrice(item.price), url: item.url,
        });
      }
      console.log(`  [Amazon] "${query}" s.${p}/${maxPages}: ${items.length} ürün`);
      await randomDelay(1500, 3000);
    } catch (err) {
      console.log(`  [Amazon] "${query}" s.${p} hata: ${err.message?.slice(0, 60)}`);
    }
  }
  return products;
}

// ==================== UPLOAD ====================
async function uploadProducts(products) {
  if (!products.length) return;
  try {
    const res = await fetch(UPLOAD_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products, secretKey: SECRET_KEY }),
    });
    const data = await res.json();
    console.log(`  📤 ${data.message || "Yüklendi"}`);
    return data;
  } catch (e) { console.error(`  ❌ Upload hatası: ${e.message}`); }
}

// ==================== ANA FONKSİYON ====================
async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "tr-TR,tr;q=0.9" });
  const agents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  ];
  await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)]);
  return { browser, page };
}

async function main() {
  console.log("🚀 SANA İYİ FİYAT — Amazon Scraper WAVE 2");
  console.log(`📊 ${SEARCH_TERMS.length} yeni kategori x ${PAGES_PER_TERM} sayfa`);
  console.log(`🔄 Her ${RESTART_EVERY} kategoride browser restart`);
  console.log("=".repeat(60));

  let totalProducts = 0;
  let totalUploaded = 0;
  let pendingProducts = [];
  let { browser, page } = await launchBrowser();

  for (let i = 0; i < SEARCH_TERMS.length; i++) {
    const term = SEARCH_TERMS[i];
    const progress = Math.round(((i + 1) / SEARCH_TERMS.length) * 100);
    console.log(`\n🔍 [${i + 1}/${SEARCH_TERMS.length}] (${progress}%) "${term}"`);

    if (i > 0 && i % RESTART_EVERY === 0) {
      console.log(`\n🔄 Browser restart (${i} kategori)...`);
      try { await browser.close(); } catch {}
      await sleep(3000);
      ({ browser, page } = await launchBrowser());
      console.log("✅ Yeni browser!\n");
    }

    try {
      const products = await scrapeAmazon(page, term, PAGES_PER_TERM);
      totalProducts += products.length;
      pendingProducts.push(...products);
      console.log(`  📦 ${products.length} ürün | Toplam: ${totalProducts}`);
    } catch (err) {
      console.log(`  ⚠️ Hata: ${err.message?.slice(0, 80)}`);
      if (err.message?.includes("detached") || err.message?.includes("closed") || err.message?.includes("Target")) {
        console.log("  🔄 Browser restart...");
        try { await browser.close(); } catch {}
        await sleep(5000);
        ({ browser, page } = await launchBrowser());
      }
    }

    if (pendingProducts.length >= BATCH_UPLOAD_SIZE) {
      await uploadProducts(pendingProducts);
      totalUploaded += pendingProducts.length;
      pendingProducts = [];
    }

    if ((i + 1) % 50 === 0) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📊 RAPOR: ${i + 1}/${SEARCH_TERMS.length} | ${totalProducts} çekildi | ${totalUploaded} yüklendi`);
      console.log(`${"=".repeat(60)}\n`);
    }
  }

  if (pendingProducts.length > 0) {
    await uploadProducts(pendingProducts);
    totalUploaded += pendingProducts.length;
  }
  try { await browser.close(); } catch {}

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 WAVE 2 TAMAMLANDI!");
  console.log(`📊 Çekilen: ${totalProducts} | Yüklenen: ${totalUploaded}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
