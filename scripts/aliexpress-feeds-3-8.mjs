#!/usr/bin/env node
/**
 * AliExpress Feed 3-8 (25-40$ → 100$+)
 */
import crypto from "crypto";
const UPLOAD_URL = "https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY = "sanaiyifiyat2026";
const BATCH_SIZE = 100;
const USD_TO_TRY = 38.5;
const MAX_PER_FEED = 150000;

const FEEDS = [
  { name: "25-40$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14280&format=xml&fcid=6115" },
  { name: "40-55$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14281&format=xml&fcid=6115" },
  { name: "55-70$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14282&format=xml&fcid=6115" },
  { name: "70-85$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14283&format=xml&fcid=6115" },
  { name: "85-100$", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14284&format=xml&fcid=6115" },
  { name: "100$+", url: "http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14285&format=xml&fcid=6115" },
];

const CATEGORY_MAP = {
  "2":"gida","3":"giyim","6":"ev-aletleri","7":"bilgisayar","13":"yapi-hirdavat",
  "15":"ev-yasam","18":"spor","21":"kirtasiye","26":"oyuncak","30":"guvenlik",
  "34":"otomotiv","36":"aksesuar","39":"aydinlatma","44":"elektronik","66":"kozmetik",
  "320":"ev-yasam","322":"ayakkabi","502":"elektronik","509":"cep-telefonu",
  "1420":"yapi-hirdavat","1501":"anne-bebek","1503":"ev-yasam","1511":"akilli-saat",
  "1524":"canta-aksesuar","200574005":"giyim","200000345":"giyim","200000343":"giyim",
  "200000297":"aksesuar","200165144":"sac-bakim","201355758":"otomotiv",
  "201768104":"spor","202192403":"cep-telefonu",
};

function generateEAN(i){return crypto.createHash("md5").update(i).digest("hex").slice(0,16)}
function formatPrice(p){return p.toLocaleString("tr-TR",{maximumFractionDigits:0})+" TL"}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

async function uploadProducts(products){
  if(!products.length)return null;
  for(let a=0;a<3;a++){
    try{
      const r=await fetch(UPLOAD_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({products,secretKey:SECRET_KEY})});
      return await r.json();
    }catch(e){console.error(`  ❌ Upload hatası (${a+1}): ${e.message}`);await sleep(5000)}
  }
  return null;
}

async function importFeed(feedUrl, feedName, maxProducts){
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📥 Feed: ${feedName}`);
  let response;
  try{response=await fetch(feedUrl);if(!response.ok){console.error(`❌ ${response.status}`);return 0}}
  catch(e){console.error(`❌ ${e.message}`);return 0}

  const reader=response.body.getReader();
  const decoder=new TextDecoder("utf-8");
  let buffer="",totalNew=0,processedCount=0,pendingProducts=[];
  const startTime=Date.now();
  console.log(`📊 Max ${maxProducts.toLocaleString()} ürün...`);

  try{
    while(true){
      const{done,value}=await reader.read();
      if(done)break;
      buffer+=decoder.decode(value,{stream:true});
      let idx;
      while((idx=buffer.indexOf("</offer>"))!==-1){
        const s=buffer.indexOf("<offer ");
        if(s===-1||s>idx){buffer=buffer.substring(idx+8);continue}
        const xml=buffer.substring(s,idx+8);
        buffer=buffer.substring(idx+8);
        if(processedCount>=maxProducts)continue;
        try{
          const id=xml.match(/id="([^"]+)"/)?.[1]||"";
          const name=xml.match(/<name>(.*?)<\/name>/s)?.[1]||"";
          const url=xml.match(/<url>(.*?)<\/url>/s)?.[1]||"";
          const price=parseFloat(xml.match(/<price>(.*?)<\/price>/)?.[1]||"0");
          const pic=xml.match(/<picture>(.*?)<\/picture>/)?.[1]||"";
          const cat=xml.match(/<categoryId>(.*?)<\/categoryId>/)?.[1]||"";
          if(!name||!url||price<=0||!pic)continue;
          const priceTL=Math.round(price*USD_TO_TRY);
          if(priceTL<=0)continue;
          pendingProducts.push({
            ean:generateEAN(`aliexpress-${id}`),
            title:name.replace(/&amp;/g,"&").replace(/&#39;/g,"'"),
            image:pic,category:CATEGORY_MAP[cat]||"genel",
            brand:name.split(" ")[0]||"",vendor:"AliExpress",
            price:priceTL,priceText:formatPrice(priceTL),
            url:url.replace(/&amp;/g,"&"),
          });
          processedCount++;
        }catch{}
        if(pendingProducts.length>=BATCH_SIZE){
          const r=await uploadProducts(pendingProducts);
          if(r){totalNew+=r.newProducts||0;
            if(processedCount%5000<BATCH_SIZE){
              const el=((Date.now()-startTime)/1000).toFixed(0);
              console.log(`  📦 ${processedCount.toLocaleString()} | +${totalNew.toLocaleString()} yeni | ${el}s`);
            }
          }
          pendingProducts=[];
        }
      }
      if(buffer.length>10_000_000){const l=buffer.lastIndexOf("</offer>");if(l>0)buffer=buffer.substring(l+8)}
    }
  }catch(e){console.log(`  ⚠️ Bağlantı koptu: ${e.message?.slice(0,50)}`)}

  if(pendingProducts.length>0){const r=await uploadProducts(pendingProducts);if(r)totalNew+=r.newProducts||0}
  console.log(`✅ ${feedName}: ${processedCount.toLocaleString()} işlendi, +${totalNew.toLocaleString()} yeni`);
  return totalNew;
}

async function main(){
  console.log("🚀 AliExpress Feed 3-8 Importer");
  console.log("=".repeat(60));
  let grand=0;
  for(let i=0;i<FEEDS.length;i++){
    console.log(`\n📋 Feed ${i+1}/${FEEDS.length}`);
    const n=await importFeed(FEEDS[i].url,FEEDS[i].name,MAX_PER_FEED);
    grand+=n;
    console.log(`🏆 Bu turda eklenen: ${grand.toLocaleString()}`);
    // Feed arası 30sn bekle
    if(i<FEEDS.length-1){console.log("⏳ 30sn bekleniyor...");await sleep(30000)}
  }
  try{const r=await fetch(UPLOAD_URL);const d=await r.json();console.log(`\n🎯 TOPLAM: ${d.products?.toLocaleString()} ürün`)}catch{}
  console.log(`\n🎉 TAMAMLANDI! +${grand.toLocaleString()} yeni ürün`);
}
main().catch(console.error);
