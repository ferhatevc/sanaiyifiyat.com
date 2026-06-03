#!/usr/bin/env node

/**
 * 🚀 SANA İYİ FİYAT — Amazon Scraper v4 (SMART RETRY)
 * 
 * İnternet koptuğunda 15 dk bekler, tekrar dener
 * Browser her 20 kategoride yenilenir
 * Daha önce çekilmiş terimleri atlar
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import crypto from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";

puppeteer.use(StealthPlugin());

const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const AFFILIATE_TAG = "sanaiyifiyat-21";
const BATCH_UPLOAD_SIZE = 50;
const PAGES_PER_TERM = 5;
const RESTART_EVERY = 20;
const INTERNET_WAIT_MS = 15 * 60 * 1000; // 15 dakika
const MAX_INTERNET_RETRIES = 5;
const PROGRESS_FILE = "./scraper-progress.json";

// ==================== MEGA ARAMA TERİMLERİ (600+) ====================
const ALL_TERMS = [
  // === WAVE 1 (orijinal 341) ===
  "iphone 15", "iphone 16", "samsung galaxy s24", "samsung galaxy a55",
  "xiaomi redmi note 13", "xiaomi 14", "oppo reno 12", "vivo v30",
  "realme 12 pro", "honor magic 6", "google pixel 8",
  "telefon kılıfı", "ekran koruyucu", "şarj kablosu", "şarj aleti",
  "kablosuz şarj", "araç telefon tutucu", "selfie çubuğu", "gimbal", "telefon tripod",
  "macbook air m3", "macbook pro m3", "lenovo ideapad", "lenovo thinkpad",
  "asus vivobook", "asus zenbook", "acer aspire", "dell inspiron",
  "hp pavilion", "hp envy", "msi katana", "monster laptop",
  "casper excalibur", "gaming laptop rtx", "chromebook",
  "masaüstü bilgisayar", "all in one bilgisayar", "mini pc",
  "bilgisayar kasası", "ram bellek", "işlemci", "ekran kartı",
  "anakart", "power supply", "bilgisayar fanı",
  "ipad air", "ipad pro", "samsung galaxy tab s9", "samsung galaxy tab a9",
  "xiaomi pad 6", "lenovo tab", "tablet kılıfı", "tablet kalem",
  "samsung smart tv", "lg oled tv", "sony bravia", "philips tv",
  "tcl tv", "55 inç tv", "65 inç tv", "75 inç tv",
  "4k monitör", "27 inç monitör", "32 inç monitör", "gaming monitör 144hz",
  "curved monitör", "taşınabilir monitör", "projeksiyon cihazı",
  "airpods pro", "samsung galaxy buds", "sony wh-1000xm5",
  "jbl tune", "jabra elite", "beats kulaklık", "anker soundcore",
  "marshall kulaklık", "bose kulaklık", "razer kulaklık",
  "jbl bluetooth hoparlör", "marshall hoparlör", "bose hoparlör",
  "harman kardon", "soundbar", "ev sinema sistemi",
  "mikrofon", "podcast mikrofon", "stüdyo mikrofon", "kablosuz mikrofon",
  "apple watch series 9", "apple watch ultra", "samsung galaxy watch 6",
  "huawei watch gt4", "xiaomi smart band 8", "garmin venu",
  "fitbit charge", "akıllı yüzük", "akıllı gözlük", "fitness bileklik",
  "canon eos r", "nikon z", "sony alpha", "fujifilm",
  "gopro hero", "dji osmo", "dji mini drone", "dji mavic",
  "aksiyon kamerası", "güvenlik kamerası", "bebek kamerası", "webcam",
  "playstation 5 slim", "ps5 oyun", "ps5 dualsense",
  "xbox series x", "xbox game pass", "xbox controller",
  "nintendo switch oled", "nintendo oyun", "gaming bilgisayar",
  "gaming mouse", "gaming klavye", "gaming kulaklık",
  "gaming monitor", "oyun koltuğu", "gamepad",
  "dyson v15", "dyson v12", "philips elektrikli süpürge",
  "bosch elektrikli süpürge", "arzum süpürge", "fakir süpürge",
  "roborock robot süpürge", "ecovacs robot süpürge", "xiaomi robot süpürge",
  "irobot roomba", "samsung jet", "karcher buharlı temizlik",
  "buharlı mop", "cam silme robotu", "elektrikli paspas",
  "philips airfryer xxl", "tefal actifry", "xiaomi airfryer",
  "arzum airfryer", "nespresso kahve makinesi", "delonghi kahve makinesi",
  "philips espresso", "arzum okka", "çay makinesi", "arzum çaycı",
  "karaca çay makinesi", "blender", "nutribullet", "philips blender",
  "mutfak robotu", "el mikseri", "tost makinesi", "waffle makinesi",
  "ekmek yapma makinesi", "yoğurt makinesi", "su ısıtıcısı",
  "kettle", "termos", "bıçak seti", "tencere seti",
  "çamaşır makinesi", "kurutma makinesi", "bulaşık makinesi",
  "buzdolabı", "derin dondurucu", "mini buzdolabı",
  "split klima", "taşınabilir klima", "vantilatör",
  "ütü", "buharlı ütü merkezi", "dikey ütü",
  "ankastre fırın", "mikrodalga fırın", "indüksiyon ocak",
  "nike air force 1", "nike air max", "adidas superstar", "adidas ultraboost",
  "new balance 574", "new balance 530", "puma suede", "converse chuck taylor",
  "vans old skool", "erkek bot", "erkek klasik ayakkabı",
  "erkek mont", "erkek deri ceket", "erkek kazak", "erkek gömlek",
  "erkek takım elbise", "erkek kravat", "erkek cüzdan",
  "erkek kemer", "erkek güneş gözlüğü",
  "kadın spor ayakkabı", "kadın topuklu", "kadın bot",
  "kadın çanta", "kadın sırt çantası", "kadın cüzdan",
  "kadın mont", "kadın trençkot", "kadın elbise",
  "kadın bluz", "kadın pantolon", "kadın etek",
  "kadın eşofman", "kadın pijama", "kadın mayo",
  "kadın güneş gözlüğü", "kadın saat", "kadın kolye",
  "kadın küpe", "kadın bileklik",
  "erkek parfüm", "kadın parfüm", "dior sauvage", "chanel bleu",
  "yves saint laurent", "carolina herrera", "hugo boss",
  "cilt bakım seti", "yüz kremi", "güneş kremi", "serum",
  "fondöten", "ruj", "maskara", "göz kalemi",
  "makyaj seti", "oje seti", "parfüm seti", "şampuan", "saç bakım seti",
  "vitamin d", "omega 3", "multivitamin", "probiyotik",
  "whey protein", "bcaa", "kreatin", "protein bar",
  "tansiyon aleti", "şeker ölçüm", "pulse oksimetre",
  "elektrikli diş fırçası", "oral-b", "ağız duşu", "diş beyazlatma",
  "bebek arabası", "mama sandalyesi", "bebek yatağı",
  "bebek bezi pampers", "biberon", "emzik", "göğüs pompası",
  "bebek telsizi", "çocuk bisiklet", "çocuk tablet",
  "lego technic", "lego city", "barbie", "hot wheels", "puzzle 1000",
  "koşu ayakkabısı", "spor ayakkabı erkek", "futbol ayakkabısı",
  "koşu bandı", "eliptik bisiklet", "kondisyon bisikleti",
  "dambıl seti", "ağırlık seti", "halter", "bench press",
  "yoga matı", "pilates topu", "direnç bandı",
  "bisiklet", "elektrikli scooter", "elektrikli bisiklet",
  "kamp çadırı", "uyku tulumu", "matara", "trekking ayakkabı",
  "koltuk takımı", "köşe koltuk", "tv ünitesi",
  "yatak başlığı", "baza", "yatak", "yorgan",
  "nevresim takımı", "havlu seti", "halı",
  "perde", "avize", "abajur", "duvar saati", "ayna",
  "çim biçme makinesi", "budama makası", "bahçe hortumu",
  "bahçe mobilyası", "şemsiye", "barbekü",
  "matkap", "vidalama", "el aleti seti", "boya silindiri",
  "yaz lastiği", "kış lastiği", "araç parfümü",
  "araç kamerası", "park sensörü", "oto müzik sistemi",
  "motor yağı", "akü", "oto yıkama makinesi", "oto koltuk kılıfı",
  "kedi maması", "köpek maması", "kedi kumu",
  "kedi tırmalama", "köpek tasma", "köpek yatağı", "akvaryum", "kuş kafesi",
  "çok satan kitaplar", "kişisel gelişim", "roman bestseller",
  "çocuk kitap seti", "ingilizce kitap", "sınav hazırlık", "e-kitap okuyucu", "kindle",

  // === WAVE 2 (yeni 300+) ===
  "iphone 16 pro max kılıf", "samsung s24 ultra kılıf", "usb c hub",
  "hdmi kablo", "usb bellek 128gb", "sd kart 256gb", "harici disk 1tb",
  "ssd 1tb", "nvme ssd", "thunderbolt dock", "laptop çantası",
  "laptop soğutucu", "laptop standı", "mekanik klavye", "kablosuz mouse",
  "ergonomik mouse", "mouse pad", "webcam 4k", "usb mikrofon",
  "ring light", "led panel ışık", "gimbal stabilizer",
  "akıllı priz", "akıllı ampul", "google home", "alexa echo",
  "wi-fi router", "mesh wifi", "powerbank 20000", "powerbank 30000",
  "ups kesintisiz güç", "uzatma kablosu", "pil şarj cihazı",
  "apple pencil", "ipad klavye", "tablet standı", "araç şarj",
  "bluetooth tracker", "airtag", "smarttag",
  "yazıcı", "lazer yazıcı", "mürekkep kartuş", "tarayıcı", "etiket yazıcı",
  "laminasyon makinesi", "ofis sandalyesi", "çalışma masası", "monitor kolu",
  "kamera çantası", "kamera tripod", "lens filtre", "kamera pili",
  "softbox", "video ışık", "green screen", "drone batarya",
  "stüdyo monitörü", "ses kartı", "mikser", "pop filter",
  "mikrofon standı", "boom arm", "akustik panel", "dj controller",
  "plak çalar", "karaoke mikrofon", "amplifikatör", "subwoofer",
  "ps5 ssd", "ps5 kulaklık", "ps5 şarj istasyonu",
  "xbox elite controller", "nintendo pro controller", "oyun masası",
  "joystick", "direksiyon seti", "vr gözlük", "meta quest 3",
  "erkek kol saati", "kadın kol saati", "casio saat", "fossil saat",
  "swatch saat", "akıllı saat kordon", "saat kutusu",
  "ray ban güneş gözlüğü", "polarize güneş gözlüğü", "mavi ışık gözlük",
  "seyahat valizi", "kabin boy valiz", "sırt çantası laptop",
  "spor çanta", "bel çantası", "çapraz çanta", "makyaj çantası", "valiz seti",
  "nike dunk low", "adidas samba", "adidas gazelle", "nike pegasus",
  "asics gel kayano", "salomon ayakkabı", "timberland bot",
  "dr martens", "birkenstock", "crocs", "terlik", "sandalet",
  "krampon", "halı saha ayakkabısı",
  "nike tayt", "adidas eşofman", "under armour tişört",
  "spor sütyeni", "koşu şort", "outdoor ceket", "termal iç giyim",
  "kettlebell", "battle rope", "trx seti", "atlama ipi",
  "boks eldiveni", "boks torbası", "foam roller", "masaj tabancası",
  "dağ bisikleti", "yol bisikleti", "katlanır bisiklet",
  "bisiklet kaskı", "bisiklet lambası", "bisiklet kilidi", "paten", "kaykay",
  "kamp ocağı", "kamp lambası", "kamp sandalyesi", "kamp masası",
  "termos çelik", "çakı", "dürbün", "teleskop", "el feneri",
  "survival kit", "ilk yardım çantası",
  "döküm tava", "teflon tava", "wok tava", "granit tencere seti",
  "düdüklü tencere", "pizza taşı", "silikon kalıp", "makarna makinesi",
  "soda makinesi", "su arıtma", "buz makinesi", "vakum makinesi",
  "meyve sıkacağı", "türk kahve makinesi", "french press",
  "kahve değirmeni", "espresso bardağı", "çay bardağı seti",
  "saç kurutma makinesi", "dyson airwrap", "saç düzleştirici", "saç maşası",
  "saç kesme makinesi", "sakal tıraş makinesi", "epilatör",
  "yüz temizleme cihazı", "vücut analiz tartısı",
  "tom ford parfüm", "versace parfüm", "armani parfüm", "gucci parfüm",
  "prada parfüm", "jo malone", "oto kokusu", "ev parfümü",
  "retinol serum", "c vitamini serum", "hyaluronik asit", "niacinamide",
  "anti aging krem", "nemlendirici", "yüz maskesi",
  "kerastase şampuan", "saç spreyi", "saç kremi", "biotin",
  "bebek puset", "oto koltuğu bebek", "kanguru bebek",
  "bebek banyo küveti", "montessori oyuncak", "oyun parkı",
  "lego star wars", "lego harry potter", "nerf silah",
  "remote control araba", "rubik küp", "monopoly", "uno", "jenga",
  "planner ajanda", "dolma kalem", "marker kalem", "çizim tableti", "wacom tablet",
  "kedi mama kabı otomatik", "kedi oyuncak", "köpek eğitim",
  "akvaryum filtre", "balık yemi", "hamster kafesi",
  "dashcam", "araç buzdolabı", "nano kaplama", "araç organizer",
  "kompresör", "lastik tamir seti",
  "akülü matkap", "darbeli matkap", "dekupaj testere",
  "taşlama makinesi", "lazer metre", "tornavida seti",
  "bilgisayar masası", "kitaplık", "gardrop", "komodin",
  "ayakkabılık", "duvar rafı",
  "led şerit", "rgb led şerit", "akıllı led", "masa lambası",
  "gece lambası", "tavan lambası", "bahçe lambası", "solar lamba",

  // === WAVE 3 (yeni ek 100+) ===
  "iphone 14 pro kılıf", "samsung a34 kılıf", "oneplus 12",
  "nothing phone", "motorola edge", "pixel buds",
  "macbook air m2", "surface pro", "ipad 10. nesil",
  "apple tv 4k", "chromecast", "fire tv stick", "roku",
  "oculus quest", "steam deck", "rog ally",
  "nvidia rtx 4070", "amd ryzen 7", "intel core i7",
  "corsair ram", "kingston ssd", "samsung evo ssd",
  "logitech mx master", "apple magic keyboard", "keychron klavye",
  "herman miller sandalye", "secretlab oyun koltuğu",
  "ikea masa", "ikea raf", "ikea dolap",
  "karcher basınçlı yıkama", "bosch matkap", "makita vidalama",
  "stanley termos", "contigo matara", "hydro flask",
  "lululemon tayt", "nike tech fleece", "north face mont",
  "columbia ceket", "patagonia", "the north face çanta",
  "osprey sırt çantası", "samsonite valiz", "american tourister",
  "ray ban aviator", "oakley gözlük", "maui jim",
  "seiko saat", "orient saat", "citizen saat", "g-shock",
  "pandora bileklik", "swarovski kolye", "tous takı",
  "mac ruj", "nars fondöten", "charlotte tilbury",
  "la roche posay", "cerave nemlendirici", "the ordinary serum",
  "olaplex saç bakım", "moroccanoil", "kerastase maske",
  "oral-b io", "philips sonicare", "waterpik",
  "nuk biberon", "avent emzik", "chicco puset",
  "fisher price oyuncak", "vtech oyuncak", "melissa doug",
  "ravensburger puzzle", "clementoni puzzle",
  "decathlon bisiklet", "btwin bisiklet", "giant bisiklet",
  "garmin edge", "wahoo kickr", "tacx trainer",
  "cafe türk kahvesi", "mehmet efendi kahve", "starbucks kapsül",
  "dolce gusto kapsül", "tchibo kahve", "illy kahve",
  "regal çay", "doğuş çay", "lipton çay",
];

// ==================== YARDIMCI FONKSİYONLAR ====================
function generateEAN(input) { return crypto.createHash("md5").update(input).digest("hex").slice(0, 16); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function randomDelay(min, max) { return sleep(Math.floor(Math.random() * (max - min + 1)) + min); }
function formatPrice(price) { return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL"; }

function extractBrand(title) {
  const brands = ["Apple","Samsung","Xiaomi","Huawei","Oppo","Sony","LG","Philips","Dyson","Bosch","Siemens","Arçelik","Beko","Vestel","Nike","Adidas","Puma","New Balance","Converse","Vans","HP","Lenovo","Asus","Acer","Dell","MSI","Monster","Casper","Canon","Nikon","JBL","Marshall","Bose","Logitech","Razer","SteelSeries","Nespresso","DeLonghi","Tefal","Braun","PlayStation","Xbox","Nintendo","LEGO","Oral-B","Dior","Chanel","Hugo Boss","Karaca","Arzum","Fakir","Roborock","iRobot","Tom Ford","Versace","Gucci","Prada","Ray-Ban","Casio","Fossil","IKEA","Garmin","Columbia","Nike","ASICS","Salomon","Timberland","Crocs","Birkenstock"];
  for (const b of brands) { if (title.toLowerCase().includes(b.toLowerCase())) return b; }
  return title.split(" ")[0] || "";
}

function normalizeCategory(q) {
  const l = q.toLowerCase();
  if (/iphone|samsung.*kılıf|telefon|şarj.*kablo|galaxy s|galaxy a|pixel|oneplus|motorola|nothing phone|oppo|vivo|realme|honor/.test(l)) return "cep-telefonu";
  if (/laptop|macbook|notebook|bilgisayar|pc|ram|işlemci|ekran kartı|anakart|ssd|nvme|surface|klavye|mouse|dock|hub|rtx|ryzen|intel|corsair|kingston/.test(l)) return "bilgisayar";
  if (/ipad|tablet|apple pencil/.test(l)) return "tablet";
  if (/tv|televizyon|chromecast|fire tv|roku|apple tv/.test(l)) return "televizyon";
  if (/monitör|monitor/.test(l)) return "monitor";
  if (/kulaklık|airpods|buds|headphone|pixel buds/.test(l)) return "kulaklik";
  if (/hoparlör|soundbar|speaker|amplifikatör|subwoofer/.test(l)) return "hoparlor";
  if (/saat|watch|band|bileklik|casio|fossil|seiko|orient|citizen|g-shock|pandora|swarovski/.test(l)) return "akilli-saat";
  if (/kamera|gopro|webcam|drone|lens|tripod|gimbal/.test(l)) return "kamera";
  if (/playstation|ps5|xbox|nintendo|gaming|oyun|gamepad|konsol|vr|quest|steam deck|rog ally/.test(l)) return "oyun";
  if (/süpürge|çamaşır|bulaşık|klima|buzdolabı|fırın|ütü|vantilatör|ups|router|wifi|akıllı priz|akıllı ampul|alexa|google home/.test(l)) return "ev-aletleri";
  if (/airfryer|kahve|çay|blender|mikser|tost|waffle|ekmek|kettle|tencere|bıçak|tava|makarna|soda|arıtma|buz|vakum|sıkacağı|french press|değirmen|düdüklü|kahvesi|kapsül/.test(l)) return "mutfak";
  if (/ayakkabı|bot|sneaker|nike(?!.*tayt|.*fleece|.*tech)|adidas(?!.*eşofman)|puma|new balance|converse|vans|dunk|samba|gazelle|crocs|terlik|sandalet|krampon|timberland|birkenstock|salomon|asics|dr.martens|decathlon|btwin/.test(l)) return "ayakkabi";
  if (/çanta|cüzdan|kemer|valiz|sırt çantası|evrak|osprey|samsonite|american tourister|north face çanta/.test(l)) return "canta-aksesuar";
  if (/mont|ceket|kazak|gömlek|takım|kravat|pantolon|elbise|etek|bluz|eşofman|pijama|mayo|tayt|şort|rüzgarlık|yağmurluk|termal|lululemon|fleece|columbia|patagonia|north face/.test(l)) return "giyim";
  if (/parfüm|dior|chanel|hugo|tom ford|versace|gucci|prada|narciso|lattafa|oud|koku|jo malone/.test(l)) return "parfum";
  if (/cilt|krem|serum|güneş|fondöten|ruj|maskara|makyaj|oje|retinol|hyaluronik|niacinamide|peeling|nemlendirici|misel|la roche|cerave|ordinary|mac ruj|nars|charlotte/.test(l)) return "kozmetik";
  if (/şampuan|saç|keratin|biotin|minoxidil|olaplex|moroccanoil|kerastase/.test(l)) return "sac-bakim";
  if (/vitamin|protein|omega|bcaa|kreatin/.test(l)) return "saglik";
  if (/diş|oral|ağız|epilat|tıraş|saç kurutma|düzleştirici|maşa|tartı|baskül|sonicare|waterpik/.test(l)) return "kisisel-bakim";
  if (/bebek|mama|biberon|emzik|çocuk|puset|oto koltuğu|kanguru|yürüteç|montessori|pişik|nuk|avent|chicco|fisher|vtech|melissa/.test(l)) return "anne-bebek";
  if (/lego|playmobil|nerf|oyuncak|slime|play doh|rubik|kutu oyunu|monopoly|uno|jenga|satranç|puzzle|ravensburger|clementoni/.test(l)) return "oyuncak";
  if (/bisiklet|koşu|spor|dambıl|yoga|pilates|fitness|scooter|kettlebell|trx|boks|paten|kaykay|garmin edge|wahoo|tacx|giant/.test(l)) return "spor";
  if (/kamp|outdoor|trekking|dürbün|teleskop|pusula|survival|çakı|fener|stanley|contigo|hydro flask/.test(l)) return "outdoor";
  if (/koltuk|yatak|yorgan|halı|perde|avize|masa(?!j)|mobilya|dekorasyon|kitaplık|gardrop|raf|portmanto|komodin|ikea|herman miller|secretlab/.test(l)) return "ev-yasam";
  if (/led|lamba|aydınlatma|aplik|sarkıt|projektör|solar/.test(l)) return "aydinlatma";
  if (/lastik|araç|oto|motor yağı|akü|park|dashcam|direksiyon|jant|kompresör|kar zinciri/.test(l)) return "otomotiv";
  if (/kedi|köpek|akvaryum|kuş|hamster|kaplumbağa|balık/.test(l)) return "evcil-hayvan";
  if (/kitap|roman|kindle|ajanda|kalem|boya|çizim|wacom|grafik/.test(l)) return "kirtasiye";
  if (/gözlük|ray.ban|polarize|oakley|maui jim/.test(l)) return "aksesuar";
  if (/mikrofon|mikser|ses kartı|akustik/.test(l)) return "ses-ekipman";
  if (/matkap|testere|taşlama|kaynak|pense|tornavida|anahtar|tester|makita|karcher basınçlı/.test(l)) return "yapi-hirdavat";
  if (/yazıcı|kartuş|tarayıcı|etiket|laminasyon/.test(l)) return "ofis";
  if (/powerbank|pil|güneş enerjisi/.test(l)) return "aksesuar";
  if (/masaj|foam roller|tens/.test(l)) return "saglik";
  if (/mangal|bahçe|çim|saksı|hamak/.test(l)) return "bahce";
  return "genel";
}

// ==================== İLERLEME TAKİBİ ====================
function loadProgress() {
  try {
    if (existsSync(PROGRESS_FILE)) {
      return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    }
  } catch {}
  return { completedTerms: [], totalProducts: 0, totalUploaded: 0 };
}

function saveProgress(progress) {
  try { writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2)); } catch {}
}

// ==================== İNTERNET KONTROL ====================
async function checkInternet() {
  try {
    const res = await fetch("https://www.google.com", { signal: AbortSignal.timeout(10000) });
    return res.ok;
  } catch { return false; }
}

async function waitForInternet() {
  for (let i = 1; i <= MAX_INTERNET_RETRIES; i++) {
    console.log(`\n⏳ İnternet bekleniyor... (deneme ${i}/${MAX_INTERNET_RETRIES})`);
    console.log(`   ${new Date().toLocaleTimeString("tr-TR")} — 15 dakika bekleniyor...`);
    await sleep(INTERNET_WAIT_MS);
    
    if (await checkInternet()) {
      console.log("✅ İnternet geri geldi!\n");
      return true;
    }
    console.log(`❌ Hala bağlantı yok.`);
  }
  console.log("🔴 İnternet geri gelmedi, çıkılıyor.");
  return false;
}

// ==================== AMAZON SCRAPER ====================
async function scrapeAmazon(page, query, maxPages) {
  const products = [];
  for (let p = 1; p <= maxPages; p++) {
    try {
      const url = `https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}&page=${p}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await sleep(2000 + Math.random() * 1500);
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
      await randomDelay(2000, 4000); // Biraz daha yavaş
    } catch (err) {
      const msg = err.message || "";
      console.log(`  [Amazon] "${query}" s.${p} hata: ${msg.slice(0, 60)}`);
      
      // İnternet koptu mu?
      if (msg.includes("DISCONNECTED") || msg.includes("FAILED") || msg.includes("TIMED_OUT")) {
        return { products, internetDown: true };
      }
    }
  }
  return { products, internetDown: false };
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
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  ];
  await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)]);
  return { browser, page };
}

async function main() {
  console.log("🚀 SANA İYİ FİYAT — Amazon Scraper v4 (SMART RETRY)");
  console.log(`📊 ${ALL_TERMS.length} toplam terim x ${PAGES_PER_TERM} sayfa`);
  console.log(`🔄 Her ${RESTART_EVERY} kategoride browser restart`);
  console.log(`⏳ İnternet koptuğunda ${INTERNET_WAIT_MS/60000} dk bekler`);
  console.log("=".repeat(60));

  // İlerleme yükle — daha önce tamamlanan terimleri atla
  const progress = loadProgress();
  const remainingTerms = ALL_TERMS.filter(t => !progress.completedTerms.includes(t));
  
  console.log(`📋 Daha önce tamamlanan: ${progress.completedTerms.length} terim`);
  console.log(`📋 Kalan: ${remainingTerms.length} terim`);
  console.log("=".repeat(60));

  if (remainingTerms.length === 0) {
    console.log("✅ Tüm terimler zaten tamamlanmış!");
    return;
  }

  let totalProducts = progress.totalProducts;
  let totalUploaded = progress.totalUploaded;
  let pendingProducts = [];
  let consecutiveInternetFails = 0;

  let { browser, page } = await launchBrowser();

  for (let i = 0; i < remainingTerms.length; i++) {
    const term = remainingTerms[i];
    const globalIndex = progress.completedTerms.length + i + 1;
    const progress_pct = Math.round((globalIndex / ALL_TERMS.length) * 100);
    console.log(`\n🔍 [${globalIndex}/${ALL_TERMS.length}] (${progress_pct}%) "${term}"`);

    // Browser restart
    if (i > 0 && i % RESTART_EVERY === 0) {
      console.log(`\n🔄 Browser restart (${i} kategori)...`);
      try { await browser.close(); } catch {}
      await sleep(3000);
      ({ browser, page } = await launchBrowser());
      console.log("✅ Yeni browser!\n");
    }

    try {
      const result = await scrapeAmazon(page, term, PAGES_PER_TERM);
      const products = result.products || [];
      totalProducts += products.length;
      pendingProducts.push(...products);
      console.log(`  📦 ${products.length} ürün | Toplam: ${totalProducts}`);

      // İnternet koptu mu?
      if (result.internetDown) {
        console.log("\n🔴 İNTERNET KOPTU!");
        
        // Önce mevcut ürünleri yükle
        if (pendingProducts.length > 0) {
          try {
            await uploadProducts(pendingProducts);
            totalUploaded += pendingProducts.length;
            pendingProducts = [];
          } catch {}
        }

        // Browser kapat
        try { await browser.close(); } catch {}

        // İlerleme kaydet
        progress.completedTerms.push(term);
        progress.totalProducts = totalProducts;
        progress.totalUploaded = totalUploaded;
        saveProgress(progress);

        // İnternet bekle
        const internetBack = await waitForInternet();
        if (!internetBack) {
          console.log("⛔ İnternet geri gelmedi. Çıkılıyor.");
          break;
        }

        // Yeni browser başlat
        ({ browser, page } = await launchBrowser());
        consecutiveInternetFails = 0;
        continue;
      }

      consecutiveInternetFails = 0;

      // Terimi tamamlandı olarak işaretle
      progress.completedTerms.push(term);
      
    } catch (err) {
      console.log(`  ⚠️ Hata: ${err.message?.slice(0, 80)}`);
      if (err.message?.includes("detached") || err.message?.includes("closed") || err.message?.includes("Target")) {
        try { await browser.close(); } catch {}
        await sleep(5000);
        ({ browser, page } = await launchBrowser());
      }
    }

    // Batch upload
    if (pendingProducts.length >= BATCH_UPLOAD_SIZE) {
      await uploadProducts(pendingProducts);
      totalUploaded += pendingProducts.length;
      pendingProducts = [];
    }

    // İlerleme kaydet (her 10 terimde)
    if ((i + 1) % 10 === 0) {
      progress.totalProducts = totalProducts;
      progress.totalUploaded = totalUploaded;
      saveProgress(progress);
    }

    // Rapor
    if ((i + 1) % 50 === 0) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📊 RAPOR: ${globalIndex}/${ALL_TERMS.length} | ${totalProducts} çekildi | ${totalUploaded} yüklendi`);
      console.log(`${"=".repeat(60)}\n`);
    }
  }

  // Kalan upload
  if (pendingProducts.length > 0) {
    await uploadProducts(pendingProducts);
    totalUploaded += pendingProducts.length;
  }

  // Son ilerleme kaydet
  progress.totalProducts = totalProducts;
  progress.totalUploaded = totalUploaded;
  saveProgress(progress);

  try { await browser.close(); } catch {}

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 TAMAMLANDI!");
  console.log(`📊 Çekilen: ${totalProducts} | Yüklenen: ${totalUploaded}`);
  console.log(`📋 Tamamlanan terim: ${progress.completedTerms.length}/${ALL_TERMS.length}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
