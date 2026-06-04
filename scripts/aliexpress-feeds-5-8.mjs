#!/usr/bin/env node
/** AliExpress Feed 5-8 (55-70$, 70-85$, 85-100$, 100$+) */
import crypto from "crypto";
const UPLOAD_URL="https://sanaiyifiyat.com/api/upload-products";
const SECRET_KEY="sanaiyifiyat2026";
const BATCH_SIZE=100;const USD_TO_TRY=38.5;const MAX_PER_FEED=150000;
const FEEDS=[
  {name:"55-70$",url:"http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14282&format=xml&fcid=6115"},
  {name:"70-85$",url:"http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14283&format=xml&fcid=6115"},
  {name:"85-100$",url:"http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14284&format=xml&fcid=6115"},
  {name:"100$+",url:"http://export.admitad.com/en/webmaster/websites/2946040/products/export_adv_products/?user=ferhat_evci95792&code=mvlcpvwgyi&feed_id=14285&format=xml&fcid=6115"},
];
const CAT={"2":"gida","3":"giyim","6":"ev-aletleri","7":"bilgisayar","13":"yapi-hirdavat","15":"ev-yasam","18":"spor","21":"kirtasiye","26":"oyuncak","30":"guvenlik","34":"otomotiv","36":"aksesuar","39":"aydinlatma","44":"elektronik","66":"kozmetik","322":"ayakkabi","502":"elektronik","509":"cep-telefonu","1420":"yapi-hirdavat","1501":"anne-bebek","1503":"ev-yasam","1511":"akilli-saat","1524":"canta-aksesuar","200574005":"giyim","200000345":"giyim","200000343":"giyim","201768104":"spor","202192403":"cep-telefonu"};
function ean(i){return crypto.createHash("md5").update(i).digest("hex").slice(0,16)}
function fp(p){return p.toLocaleString("tr-TR",{maximumFractionDigits:0})+" TL"}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function upload(products){
  if(!products.length)return null;
  for(let a=0;a<3;a++){try{const r=await fetch(UPLOAD_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({products,secretKey:SECRET_KEY})});return await r.json()}catch(e){console.error(`  ❌ (${a+1}): ${e.message}`);await sleep(5000)}}return null;
}
async function importFeed(f){
  console.log(`\n${"=".repeat(50)}\n📥 ${f.name}`);
  let res;try{res=await fetch(f.url);if(!res.ok){console.error(`❌ ${res.status}`);return 0}}catch(e){console.error(`❌ ${e.message}`);return 0}
  const reader=res.body.getReader(),dec=new TextDecoder("utf-8");
  let buf="",tot=0,cnt=0,pend=[];const st=Date.now();
  try{while(true){
    const{done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});
    let idx;while((idx=buf.indexOf("</offer>"))!==-1){
      const s=buf.indexOf("<offer ");if(s===-1||s>idx){buf=buf.substring(idx+8);continue}
      const x=buf.substring(s,idx+8);buf=buf.substring(idx+8);if(cnt>=MAX_PER_FEED)continue;
      try{const id=x.match(/id="([^"]+)"/)?.[1]||"";const nm=x.match(/<name>(.*?)<\/name>/s)?.[1]||"";const u=x.match(/<url>(.*?)<\/url>/s)?.[1]||"";const p=parseFloat(x.match(/<price>(.*?)<\/price>/)?.[1]||"0");const pic=x.match(/<picture>(.*?)<\/picture>/)?.[1]||"";const c=x.match(/<categoryId>(.*?)<\/categoryId>/)?.[1]||"";
        if(!nm||!u||p<=0||!pic)continue;const tl=Math.round(p*USD_TO_TRY);if(tl<=0)continue;
        pend.push({ean:ean(`aliexpress-${id}`),title:nm.replace(/&amp;/g,"&").replace(/&#39;/g,"'"),image:pic,category:CAT[c]||"genel",brand:nm.split(" ")[0]||"",vendor:"AliExpress",price:tl,priceText:fp(tl),url:u.replace(/&amp;/g,"&")});cnt++;
      }catch{}
      if(pend.length>=BATCH_SIZE){const r=await upload(pend);if(r){tot+=r.newProducts||0;if(cnt%5000<BATCH_SIZE)console.log(`  📦 ${cnt.toLocaleString()} | +${tot.toLocaleString()} | ${((Date.now()-st)/1000).toFixed(0)}s`)}pend=[]}
    }
    if(buf.length>10_000_000){const l=buf.lastIndexOf("</offer>");if(l>0)buf=buf.substring(l+8)}
  }}catch(e){console.log(`  ⚠️ Koptu: ${e.message?.slice(0,40)}`)}
  if(pend.length>0){const r=await upload(pend);if(r)tot+=r.newProducts||0}
  console.log(`✅ ${f.name}: ${cnt.toLocaleString()} işlendi, +${tot.toLocaleString()} yeni`);return tot;
}
async function main(){
  console.log("🚀 Feed 5-8 Importer");let g=0;
  for(let i=0;i<FEEDS.length;i++){const n=await importFeed(FEEDS[i]);g+=n;console.log(`🏆 Toplam: +${g.toLocaleString()}`);if(i<FEEDS.length-1){console.log("⏳ 30sn...");await sleep(30000)}}
  try{const r=await fetch(UPLOAD_URL);const d=await r.json();console.log(`\n🎯 DB TOPLAM: ${d.products?.toLocaleString()} ürün`)}catch{}
  console.log(`\n🎉 BİTTİ! +${g.toLocaleString()} yeni`);
}
main().catch(console.error);
