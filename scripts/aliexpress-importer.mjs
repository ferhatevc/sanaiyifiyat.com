#!/usr/bin/env node

/**
 * 🚀 SANA İYİ FİYAT — AliExpress XML Feed Importer
 * Admitad XML feed'inden ürünleri çekip veritabanına yükler
 * 
 * 1M+ ürün - streaming XML parser ile bellek dostu
 */

import crypto from "crypto";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { Writable } from "stream";

const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const BATCH_SIZE = 100;
const USD_TO_TRY = 38.5; // Yaklaşık kur

// AliExpress feed URL'leri - farklı fiyat aralıkları
const FEEDS = [
  {
    name: "Under 10$",
    url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14107&format=xml&fcid=6115",
  },
];

// ==================== KATEGORİ HARİTASI ====================
const CATEGORY_MAP = {
  "2": "gida",
  "3": "giyim",
  "6": "ev-aletleri",
  "7": "bilgisayar",
  "13": "yapi-hirdavat",
  "15": "ev-yasam",
  "18": "spor",
  "21": "kirtasiye",
  "26": "oyuncak",
  "30": "guvenlik",
  "34": "otomotiv",
  "36": "aksesuar",
  "39": "aydinlatma",
  "44": "elektronik",
  "66": "kozmetik",
  "320": "ev-yasam",
  "322": "ayakkabi",
  "502": "elektronik",
  "509": "cep-telefonu",
  "1420": "yapi-hirdavat",
  "1501": "anne-bebek",
  "1503": "ev-yasam",
  "1511": "akilli-saat",
  "1524": "canta-aksesuar",
  "200574005": "giyim",
  "200000345": "giyim",
  "200000343": "giyim",
  "200000297": "aksesuar",
  "200165144": "sac-bakim",
  "201355758": "otomotiv",
  "201768104": "spor",
  "202192403": "cep-telefonu",
};

// ==================== YARDIMCI FONKSİYONLAR ====================
function generateEAN(input) {
  return crypto.createHash("md5").update(input).digest("hex").slice(0, 16);
}

function formatPrice(price) {
  return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";
}

function mapCategory(categoryId) {
  return CATEGORY_MAP[categoryId] || "genel";
}

function extractBrand(title) {
  // AliExpress'te genelde marka title'ın başında olur
  const words = title.split(" ");
  if (words.length > 0) return words[0];
  return "";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ==================== UPLOAD ====================
async function uploadProducts(products) {
  if (!products.length) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, secretKey: SECRET_KEY }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.error(`  ❌ Upload hatası (deneme ${attempt + 1}): ${e.message}`);
      await sleep(5000);
    }
  }
  return null;
}

// ==================== XML STREAM PARSER ====================
// Basit regex tabanlı streaming XML parser (sax gerektirmez)
async function parseAndImportFeed(feedUrl, feedName) {
  console.log(`\n📥 Feed indiriliyor: ${feedName}`);
  console.log(`   URL: ${feedUrl.slice(0, 80)}...`);

  const response = await fetch(feedUrl);
  if (!response.ok) {
    console.error(`❌ Feed indirilemedi: ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let totalProducts = 0;
  let totalUploaded = 0;
  let errors = 0;
  let pendingProducts = [];
  let processedCount = 0;
  const MAX_PRODUCTS = 500000; // İlk 500K ürün

  console.log(`📊 Parsing başlıyor (max ${MAX_PRODUCTS.toLocaleString()} ürün)...`);
  const startTime = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Buffer'dan tamamlanmış <offer>...</offer> bloklarını çıkar
    let offerEndIndex;
    while ((offerEndIndex = buffer.indexOf("</offer>")) !== -1) {
      const offerStartIndex = buffer.indexOf("<offer ");
      if (offerStartIndex === -1 || offerStartIndex > offerEndIndex) {
        // Garip durum - temizle ve devam et
        buffer = buffer.substring(offerEndIndex + 8);
        continue;
      }

      const offerXml = buffer.substring(offerStartIndex, offerEndIndex + 8);
      buffer = buffer.substring(offerEndIndex + 8);

      // Max ürüne ulaştık mı?
      if (processedCount >= MAX_PRODUCTS) continue;

      // Offer XML'den verileri çıkar
      try {
        const id = offerXml.match(/id="([^"]+)"/)?.[1] || "";
        const name = offerXml.match(/<name>(.*?)<\/name>/s)?.[1] || "";
        const url = offerXml.match(/<url>(.*?)<\/url>/s)?.[1] || "";
        const price = parseFloat(offerXml.match(/<price>(.*?)<\/price>/)?.[1] || "0");
        const picture = offerXml.match(/<picture>(.*?)<\/picture>/)?.[1] || "";
        const categoryId = offerXml.match(/<categoryId>(.*?)<\/categoryId>/)?.[1] || "";

        if (!name || !url || price <= 0 || !picture) continue;

        // HTML entities decode
        const decodedUrl = url.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        const decodedName = name.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'");

        // USD → TL çevirimi
        const priceTL = Math.round(price * USD_TO_TRY);

        if (priceTL <= 0) continue;

        pendingProducts.push({
          ean: generateEAN(`aliexpress-${id}`),
          title: decodedName,
          image: picture,
          category: mapCategory(categoryId),
          brand: extractBrand(decodedName),
          vendor: "AliExpress",
          price: priceTL,
          priceText: formatPrice(priceTL),
          url: decodedUrl,
        });

        processedCount++;

      } catch (e) {
        errors++;
      }

      // Batch upload
      if (pendingProducts.length >= BATCH_SIZE) {
        const result = await uploadProducts(pendingProducts);
        if (result) {
          totalUploaded += pendingProducts.length;
          const newP = result.newProducts || 0;
          totalProducts += newP;
          
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          const rate = (processedCount / (elapsed || 1)).toFixed(0);
          
          if (processedCount % 1000 < BATCH_SIZE) {
            console.log(`  📦 ${processedCount.toLocaleString()} işlendi | ${totalProducts.toLocaleString()} yeni | ${rate}/sn | ${elapsed}s`);
          }
        }
        pendingProducts = [];
      }
    }

    // Bellek kontrolü - buffer çok büyüdüyse temizle
    if (buffer.length > 10_000_000) {
      const lastOfferEnd = buffer.lastIndexOf("</offer>");
      if (lastOfferEnd > 0) {
        buffer = buffer.substring(lastOfferEnd + 8);
      }
    }
  }

  // Kalan ürünleri yükle
  if (pendingProducts.length > 0) {
    const result = await uploadProducts(pendingProducts);
    if (result) {
      totalUploaded += pendingProducts.length;
      totalProducts += result.newProducts || 0;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Feed tamamlandı: ${feedName}`);
  console.log(`📊 İşlenen: ${processedCount.toLocaleString()}`);
  console.log(`📤 Yüklenen: ${totalUploaded.toLocaleString()}`);
  console.log(`🆕 Yeni ürün: ${totalProducts.toLocaleString()}`);
  console.log(`⏱️ Süre: ${totalTime} dakika`);
  console.log(`❌ Hatalar: ${errors}`);
  console.log("=".repeat(60));
}

// ==================== ANA FONKSİYON ====================
async function main() {
  console.log("🚀 SANA İYİ FİYAT — AliExpress XML Importer");
  console.log(`📊 ${FEEDS.length} feed işlenecek`);
  console.log(`💱 Kur: 1 USD = ${USD_TO_TRY} TL`);
  console.log(`📦 Max: 500.000 ürün`);
  console.log("=".repeat(60));

  for (const feed of FEEDS) {
    await parseAndImportFeed(feed.url, feed.name);
  }

  // Son toplam kontrol
  try {
    const res = await fetch(`${UPLOAD_URL}`);
    const data = await res.json();
    console.log(`\n🎯 VERİTABANI TOPLAMI: ${data.products?.toLocaleString()} ürün, ${data.offers?.toLocaleString()} teklif`);
  } catch {}

  console.log("\n🎉 İŞLEM TAMAMLANDI!");
}

main().catch(console.error);
