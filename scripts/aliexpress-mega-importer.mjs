#!/usr/bin/env node

/**
 * 🚀 SANA İYİ FİYAT — AliExpress MEGA Importer
 * 8 feed x ~1M ürün = MİLYONLARCA ÜRÜN
 * Feed 1 zaten import ediliyor, bu script feed 2-8'i işler
 */

import crypto from "crypto";

const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const BATCH_SIZE = 100;
const USD_TO_TRY = 38.5;
const MAX_PER_FEED = 200000; // Her feed'den max 200K (toplam ~1.4M)

const FEEDS = [
  { name: "10-25$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14267&format=xml&fcid=6115" },
  { name: "25-40$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14280&format=xml&fcid=6115" },
  { name: "40-55$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14281&format=xml&fcid=6115" },
  { name: "55-70$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14282&format=xml&fcid=6115" },
  { name: "70-85$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14283&format=xml&fcid=6115" },
  { name: "85-100$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14284&format=xml&fcid=6115" },
  { name: "100$+", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14285&format=xml&fcid=6115" },
];

const CATEGORY_MAP = {
  "2": "gida", "3": "giyim", "6": "ev-aletleri", "7": "bilgisayar",
  "13": "yapi-hirdavat", "15": "ev-yasam", "18": "spor", "21": "kirtasiye",
  "26": "oyuncak", "30": "guvenlik", "34": "otomotiv", "36": "aksesuar",
  "39": "aydinlatma", "44": "elektronik", "66": "kozmetik", "320": "ev-yasam",
  "322": "ayakkabi", "502": "elektronik", "509": "cep-telefonu",
  "1420": "yapi-hirdavat", "1501": "anne-bebek", "1503": "ev-yasam",
  "1511": "akilli-saat", "1524": "canta-aksesuar", "200574005": "giyim",
  "200000345": "giyim", "200000343": "giyim", "200000297": "aksesuar",
  "200165144": "sac-bakim", "201355758": "otomotiv", "201768104": "spor",
  "202192403": "cep-telefonu",
};

function generateEAN(input) { return crypto.createHash("md5").update(input).digest("hex").slice(0, 16); }
function formatPrice(price) { return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL"; }
function mapCategory(categoryId) { return CATEGORY_MAP[categoryId] || "genel"; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function uploadProducts(products) {
  if (!products.length) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, secretKey: SECRET_KEY }),
      });
      return await res.json();
    } catch (e) {
      console.error(`  ❌ Upload hatası (${attempt + 1}): ${e.message}`);
      await sleep(5000);
    }
  }
  return null;
}

async function importFeed(feedUrl, feedName, maxProducts) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📥 Feed: ${feedName}`);
  console.log(`   URL: ${feedUrl.slice(0, 80)}...`);

  let response;
  try {
    response = await fetch(feedUrl);
    if (!response.ok) { console.error(`❌ Feed indirilemedi: ${response.status}`); return 0; }
  } catch (e) {
    console.error(`❌ Bağlantı hatası: ${e.message}`);
    return 0;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let totalNew = 0, totalUploaded = 0, processedCount = 0;
  let pendingProducts = [];
  const startTime = Date.now();

  console.log(`📊 Parsing başlıyor (max ${maxProducts.toLocaleString()} ürün)...`);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let offerEndIndex;
    while ((offerEndIndex = buffer.indexOf("</offer>")) !== -1) {
      const offerStartIndex = buffer.indexOf("<offer ");
      if (offerStartIndex === -1 || offerStartIndex > offerEndIndex) {
        buffer = buffer.substring(offerEndIndex + 8);
        continue;
      }
      const offerXml = buffer.substring(offerStartIndex, offerEndIndex + 8);
      buffer = buffer.substring(offerEndIndex + 8);

      if (processedCount >= maxProducts) continue;

      try {
        const id = offerXml.match(/id="([^"]+)"/)?.[1] || "";
        const name = offerXml.match(/<name>(.*?)<\/name>/s)?.[1] || "";
        const url = offerXml.match(/<url>(.*?)<\/url>/s)?.[1] || "";
        const price = parseFloat(offerXml.match(/<price>(.*?)<\/price>/)?.[1] || "0");
        const picture = offerXml.match(/<picture>(.*?)<\/picture>/)?.[1] || "";
        const categoryId = offerXml.match(/<categoryId>(.*?)<\/categoryId>/)?.[1] || "";
        if (!name || !url || price <= 0 || !picture) continue;

        const priceTL = Math.round(price * USD_TO_TRY);
        if (priceTL <= 0) continue;

        pendingProducts.push({
          ean: generateEAN(`aliexpress-${id}`),
          title: name.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'"),
          image: picture,
          category: mapCategory(categoryId),
          brand: name.split(" ")[0] || "",
          vendor: "AliExpress",
          price: priceTL,
          priceText: formatPrice(priceTL),
          url: url.replace(/&amp;/g, "&"),
        });
        processedCount++;
      } catch {}

      if (pendingProducts.length >= BATCH_SIZE) {
        const result = await uploadProducts(pendingProducts);
        if (result) {
          totalUploaded += pendingProducts.length;
          totalNew += result.newProducts || 0;
          if (processedCount % 5000 < BATCH_SIZE) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (processedCount / (elapsed || 1)).toFixed(0);
            console.log(`  📦 ${processedCount.toLocaleString()} işlendi | ${totalNew.toLocaleString()} yeni | ${rate}/sn | ${elapsed}s`);
          }
        }
        pendingProducts = [];
      }
    }
    if (buffer.length > 10_000_000) {
      const last = buffer.lastIndexOf("</offer>");
      if (last > 0) buffer = buffer.substring(last + 8);
    }
  }

  if (pendingProducts.length > 0) {
    const result = await uploadProducts(pendingProducts);
    if (result) { totalUploaded += pendingProducts.length; totalNew += result.newProducts || 0; }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`✅ ${feedName}: ${processedCount.toLocaleString()} işlendi, ${totalNew.toLocaleString()} yeni, ${totalTime} dk`);
  return totalNew;
}

async function main() {
  console.log("🚀 SANA İYİ FİYAT — AliExpress MEGA Importer");
  console.log(`📊 ${FEEDS.length} feed x max ${MAX_PER_FEED.toLocaleString()} = ${(FEEDS.length * MAX_PER_FEED).toLocaleString()} ürün`);
  console.log(`💱 Kur: 1 USD = ${USD_TO_TRY} TL`);
  console.log("=".repeat(60));

  let grandTotal = 0;
  for (let i = 0; i < FEEDS.length; i++) {
    console.log(`\n📋 Feed ${i + 1}/${FEEDS.length}`);
    const added = await importFeed(FEEDS[i].url, FEEDS[i].name, MAX_PER_FEED);
    grandTotal += added;
    console.log(`🏆 Toplam yeni eklenen: ${grandTotal.toLocaleString()}`);
  }

  try {
    const res = await fetch(UPLOAD_URL);
    const data = await res.json();
    console.log(`\n🎯 VERİTABANI TOPLAMI: ${data.products?.toLocaleString()} ürün`);
  } catch {}

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 MEGA IMPORT TAMAMLANDI!");
  console.log(`📊 Toplam eklenen: ${grandTotal.toLocaleString()} yeni ürün`);
  console.log("=".repeat(60));
}

main().catch(console.error);
