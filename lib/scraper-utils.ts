import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Generate a unique EAN from a string (product URL or title+vendor)
export function generateEAN(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex").slice(0, 16);
}

// Sleep utility for rate limiting
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Random delay between min and max ms
export function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return sleep(ms);
}

// Common headers to mimic a browser
export const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

// Product interface for scraped data
export interface ScrapedProduct {
  ean: string;
  title: string;
  image: string;
  category: string;
  brand: string;
  vendor: string;
  price: number;
  priceText: string;
  url: string;
}

// Batch upsert products into the database
export async function batchUpsertProducts(
  products: ScrapedProduct[]
): Promise<{ newProducts: number; newOffers: number }> {
  let newProducts = 0;
  let newOffers = 0;

  // Process in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    for (const item of batch) {
      try {
        // Skip invalid products
        if (!item.title || !item.price || item.price <= 0) continue;

        // Try to find existing product
        let product = await prisma.product.findUnique({
          where: { ean: item.ean },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              ean: item.ean,
              title: item.title,
              image: item.image,
              category: item.category,
              brand: item.brand,
            },
          });
          newProducts++;
        }

        // Upsert the offer
        await prisma.offer.upsert({
          where: {
            productId_vendor: {
              productId: product.id,
              vendor: item.vendor,
            },
          },
          update: {
            price: item.price,
            priceText: item.priceText,
            url: item.url,
            updatedAt: new Date(),
          },
          create: {
            productId: product.id,
            vendor: item.vendor,
            price: item.price,
            priceText: item.priceText,
            url: item.url,
          },
        });
        newOffers++;
      } catch (e: any) {
        // Skip duplicate or error items silently
        if (!e.message?.includes("Unique constraint")) {
          console.error(`Error processing ${item.title}: ${e.message}`);
        }
      }
    }
  }

  return { newProducts, newOffers };
}

// Normalize category slug
export function normalizeCategory(raw: string): string {
  const mapping: Record<string, string> = {
    "Elektronik": "elektronik",
    "Telefon": "cep-telefonu",
    "Cep Telefonu": "cep-telefonu",
    "Bilgisayar": "bilgisayar",
    "Laptop": "bilgisayar",
    "Tablet": "tablet",
    "Televizyon": "televizyon",
    "TV": "televizyon",
    "Kulaklık": "kulaklik",
    "Akıllı Saat": "akilli-saat",
    "Ev Aletleri": "ev-aletleri",
    "Elektrikli Süpürge": "ev-aletleri",
    "Çamaşır Makinesi": "ev-aletleri",
    "Bulaşık Makinesi": "ev-aletleri",
    "Klima": "ev-aletleri",
    "Airfryer": "ev-aletleri",
    "Kahve Makinesi": "ev-aletleri",
    "Çay Makinesi": "ev-aletleri",
    "Robot Süpürge": "ev-aletleri",
    "Aspiratör": "ev-aletleri",
    "Blender": "ev-aletleri",
    "Ütü": "ev-aletleri",
    "Ayakkabı": "giyim",
    "Spor Ayakkabı": "giyim",
    "Çanta": "giyim",
    "Saat": "giyim",
    "Gözlük": "giyim",
    "Parfüm": "kozmetik",
    "Mont": "giyim",
    "Elbise": "giyim",
    "Gömlek": "giyim",
    "Pantolon": "giyim",
    "Kazak": "giyim",
    "Bisiklet": "spor",
    "Koşu Bandı": "spor",
    "Oyun Konsolu": "oyun",
    "Gamepad": "oyun",
    "Lastik": "oto-sanayi",
    "Motor Yağı": "oto-sanayi",
    "Kitap": "kitap",
    "Bebek Arabası": "anne-bebek",
    "Oyuncak": "anne-bebek",
    "Mobilya": "ev-yasam",
    "Koltuk": "ev-yasam",
    "Yatak": "ev-yasam",
  };

  // Try exact match first
  if (mapping[raw]) return mapping[raw];

  // Try case-insensitive partial match
  const lower = raw.toLowerCase();
  for (const [key, val] of Object.entries(mapping)) {
    if (lower.includes(key.toLowerCase())) return val;
  }

  // Default: slugify the raw string
  return raw
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Format price to Turkish format
export function formatPriceTR(price: number): string {
  return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";
}

// Extract brand from title (first word or known brand)
export function extractBrand(title: string): string {
  const knownBrands = [
    "Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Vivo", "Realme",
    "iPhone", "Sony", "LG", "Philips", "Dyson", "Bosch", "Siemens",
    "Arçelik", "Beko", "Vestel", "Grundig", "Arzum", "Karaca",
    "Nike", "Adidas", "Puma", "New Balance", "Converse", "Vans",
    "HP", "Lenovo", "Asus", "Acer", "Dell", "MSI", "Monster",
    "Casper", "Toshiba", "Canon", "Nikon", "JBL", "Marshall",
    "Logitech", "Razer", "SteelSeries", "HyperX", "Corsair",
    "Michelin", "Bridgestone", "Continental", "Goodyear", "Pirelli",
    "Nespresso", "DeLonghi", "Tefal", "Rowenta", "Braun",
    "PlayStation", "Xbox", "Nintendo", "LEGO",
    "Zara", "Mango", "H&M", "Koton", "DeFacto", "LC Waikiki",
    "Nivea", "L'Oreal", "MAC", "Maybelline", "Dove",
    "Oral-B", "Gillette", "Head & Shoulders",
  ];

  const titleUpper = title;
  for (const brand of knownBrands) {
    if (titleUpper.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }

  // Fallback: first word
  return title.split(" ")[0] || "";
}

// All search terms for comprehensive scraping
export const SEARCH_TERMS = [
  // Electronics
  "iphone", "samsung telefon", "xiaomi telefon", "oppo telefon",
  "laptop", "gaming laptop", "macbook", "lenovo laptop", "asus laptop",
  "tablet", "ipad", "samsung tablet",
  "televizyon", "smart tv", "4k tv", "oled tv",
  "kulaklik", "bluetooth kulaklik", "airpods", "jbl kulaklik",
  "akilli saat", "apple watch", "samsung galaxy watch",
  "powerbank", "sarj aleti", "telefon kilifi",
  "monitor", "gaming monitor", "curved monitor",
  "klavye", "mekanik klavye", "gaming klavye",
  "mouse", "gaming mouse", "kablosuz mouse",
  "kamera", "aksiyon kamera", "guvenlik kamera",
  "drone", "dji drone",
  "hoparlor", "bluetooth hoparlor", "soundbar",
  "mikrofon", "podcast mikrofon",
  "yazici", "tarayici",
  "hard disk", "ssd", "flash bellek", "hafiza karti",
  
  // Home Appliances
  "elektrikli supurge", "robot supurge", "dikey supurge",
  "camasir makinesi", "kurutma makinesi",
  "bulasik makinesi",
  "klima", "split klima",
  "buzdolabi", "mini buzdolabi",
  "firin", "ankastre firin", "mikrodalga firin",
  "aspirator", "davlumbaz",
  "airfryer", "fritoz",
  "tost makinesi", "waffle makinesi",
  "cay makinesi", "kahve makinesi", "turk kahvesi makinesi", "filtre kahve",
  "blender", "el blender", "mutfak robotu",
  "utu", "buharli utu",
  "su aritma", "su isiticisi",
  "ekmek yapma makinesi",
  "elektrikli ocak", "induksiyon ocak",
  
  // Fashion
  "erkek ayakkabi", "kadin ayakkabi", "spor ayakkabi",
  "nike ayakkabi", "adidas ayakkabi", "new balance",
  "erkek canta", "kadin canta", "sirt cantasi",
  "kol saati", "akilli saat",
  "gunes gozlugu", "optik gozluk",
  "erkek parfum", "kadin parfum",
  "mont", "kaban", "yagmurluk",
  "kazak", "hirka", "sweatshirt",
  "gomlek", "tisort", "polo tisort",
  "elbise", "abiye", "etek",
  "pantolon", "jean", "sort",
  "ic camasiri", "pijama", "corap",
  "takim elbise", "kravat",
  "cuzdan", "kemer",
  
  // Baby & Kids
  "bebek arabasi", "mama sandalyesi",
  "bebek bezi", "islak mendil",
  "oyuncak", "lego", "puzzle",
  "cocuk bisiklet", "paten",
  "cocuk kiyafet", "bebek kiyafet",
  "biberon", "emzik",
  
  // Sports & Outdoors
  "bisiklet", "elektrikli bisiklet",
  "kosu bandi", "eliptik bisiklet", "kondisyon bisikleti",
  "dambil", "ağırlık seti", "halter",
  "yoga mati", "pilates topu",
  "spor cantasi", "tenis raketi", "badminton",
  "kamp cadiri", "uyku tulumu", "matara",
  "balik oltasi", "outdoor ayakkabi",
  
  // Garden & Tools
  "bahce mobilyasi", "sezlong", "hamak",
  "cim bicme makinesi", "budama makasi",
  "matkap", "vidalama", "testere",
  "el aleti seti", "tornavida seti",
  "boya", "fircasi",
  
  // Automotive
  "lastik", "yaz lastigi", "kis lastigi",
  "oto aksesuar", "telefon tutucu",
  "motor yagi", "antifriz",
  "arac kamera", "park sensoru",
  "arac parfumu", "oto yikama",
  
  // Books
  "roman", "cok satan kitap", "kisisel gelisim",
  "cocuk kitap", "boyama kitabi",
  "bilgisayar kitap", "programlama",
  
  // Health & Beauty
  "cilt bakimi", "yuz kremi", "serum",
  "sac bakimi", "sampuan", "sac boyasi",
  "makyaj", "fondoten", "ruj", "maskara",
  "vitamin", "balik yagi", "probiyotik",
  "protein tozu", "whey protein", "bcaa",
  "dis fircasi", "elektrikli dis fircasi",
  "tiras makinesi", "epilator", "sac kurutma",
  
  // Pet
  "kedi mamasi", "kopek mamasi",
  "kedi kumu", "kedi tirmik",
  "kopek tasma", "kopek yatagi",
  "akvaryum", "kus yemi",
  
  // Gaming
  "playstation 5", "xbox", "nintendo switch",
  "gamepad", "joystick",
  "gaming laptop", "gaming bilgisayar",
  "gaming mouse", "gaming klavye", "gaming kulaklik",
  "oyun koltuğu", "gaming monitor",
  
  // Home & Living
  "koltuk", "kanepe", "tv unitesi",
  "yatak", "baza", "yorgan", "yastik",
  "hali", "perde", "avize",
  "masa", "sandalye", "calisma masasi",
  "mutfak seti", "tabak", "tencere seti",
  "havlu", "bornoz", "nevresim",
  "dekorasyon", "tablo", "vazo",
];
