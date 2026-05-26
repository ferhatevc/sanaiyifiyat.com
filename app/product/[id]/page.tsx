import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import PriceHistoryChart from "@/components/PriceHistoryChart";

const prisma = new PrismaClient();

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15+ için params'ı çözümlüyoruz
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
        offers: {
            orderBy: { price: 'asc' }
        }
    }
  });

  if (!product) {
    return (
        <main className="custom-container" style={{paddingTop: '40px', minHeight: '60vh', textAlign: 'center'}}>
            <h1>Ürün Bulunamadı!</h1>
            <p>Aradığınız ürün yayından kaldırılmış veya bağlantı hatalı olabilir.</p>
            <Link href="/" className="compare-btn" style={{display: 'inline-block', marginTop: '20px', textDecoration: 'none'}}>Anasayfaya Dön</Link>
        </main>
    );
  }

  const sellers = product.offers.map((offer, idx) => {
      let logo = "fa-solid fa-store";
      const vendorLow = offer.vendor.toLowerCase();
      if (vendorLow.includes("amazon")) logo = "fa-brands fa-amazon";
      if (vendorLow.includes("hepsiburada")) logo = "fa-solid fa-shop";
      if (vendorLow.includes("trendyol")) logo = "fa-solid fa-bag-shopping";
      
      return {
          id: offer.id,
          name: offer.vendor,
          priceText: offer.priceText,
          price: offer.price,
          isCheapest: idx === 0, // orderBy asc olduğu için 0. index her zaman en ucuzdur
          logo: logo
      };
  });

  const cheapestOfferText = sellers.length > 0 ? sellers[0].priceText : "Fiyat Bulunamadı";

  return (
    <main className="custom-container" style={{paddingTop: '20px', paddingBottom: '60px'}}>
      
      {/* Geri Dönüş Linki */}
      <Link href="/" style={{color: '#aaa', textDecoration: 'none', display: 'inline-block', marginBottom: '20px'}}>
          <i className="fa-solid fa-arrow-left"></i> Sonuçlara Dön
      </Link>

      <div className="product-detail-layout" style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
        
        {/* Sol Taraf: Ürün Görseli ve Bilgisi */}
        <div className="product-detail-image" style={{flex: '1', minWidth: '300px', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center', alignSelf: 'flex-start'}}>
          <img src={product.image} alt={product.title} style={{maxWidth: '100%', maxHeight: '400px', objectFit: 'contain'}} />
          <h1 style={{color: '#121212', marginTop: '20px', fontSize: '22px', fontWeight: 'bold'}}>{product.title}</h1>
          
          <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#121212', border: '1px solid #eee'}}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '5px'}}>En Düşük Fiyat:</div>
            <strong style={{color: '#e50914', fontSize: '28px'}}>{cheapestOfferText}</strong>
          </div>
          
          <div style={{marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
              <button style={{padding: '10px 15px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', color: '#333'}}>
                  <i className="fa-regular fa-bell"></i> Fiyat Alarmı Kur
              </button>
              <button style={{padding: '10px 15px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', color: '#333'}}>
                  <i className="fa-regular fa-heart"></i> Favoriye Al
              </button>
          </div>
          
          {/* FİYAT GEÇMİŞİ GRAFİĞİ (AŞAMA 5) */}
          <PriceHistoryChart currentPrice={sellers.length > 0 ? sellers[0].price : 0} />
        </div>

        {/* Sağ Taraf: Fiyat Kıyaslama Listesi (Para Kazandıran Kısım) */}
        <div className="product-detail-vendors" style={{flex: '2', minWidth: '350px'}}>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{margin: 0}}>Fiyat Karşılaştırması</h2>
            <span style={{backgroundColor: '#333', padding: '5px 12px', borderRadius: '20px', fontSize: '14px'}}>{sellers.length} Satıcı Listeleniyor</span>
          </div>
          
          <div className="vendor-list" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {sellers.map((seller, idx) => (
              <div key={idx} className="vendor-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '12px', border: seller.isCheapest ? '2px solid #e50914' : '1px solid #333', transition: 'transform 0.2s'}}>
                
                <div className="vendor-info" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <div style={{width: '40px', height: '40px', backgroundColor: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                      <i className={seller.logo}></i>
                  </div>
                  <div>
                      <h3 style={{margin: '0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                          {seller.name}
                          {seller.isCheapest && <span style={{display: 'inline-block', backgroundColor: '#e50914', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '4px'}}>En Ucuz</span>}
                      </h3>
                      <div style={{fontSize: '12px', color: '#aaa', marginTop: '4px'}}>Kargo Bedava</div>
                  </div>
                </div>

                <div className="vendor-price" style={{fontSize: '22px', fontWeight: 'bold', color: '#fff'}}>
                  {seller.priceText}
                </div>

                {/* PARA KAZANDIRAN BUTON */}
                <a href={`/go/${seller.id}`} target="_blank" rel="noopener noreferrer" className="compare-btn" style={{textDecoration: 'none', padding: '12px 24px', whiteSpace: 'nowrap'}}>
                  Mağazaya Git <i className="fa-solid fa-arrow-up-right-from-square" style={{marginLeft: '5px'}}></i>
                </a>
              </div>
            ))}
          </div>
          
          {/* Kullanıcıya / Yatırımcıya Bilgi Notu */}
          <div className="affiliate-info" style={{marginTop: '30px', padding: '20px', backgroundColor: 'rgba(229, 9, 20, 0.05)', border: '1px dashed #e50914', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: '#ccc'}}>
            <h4 style={{color: '#e50914', margin: '0 0 10px 0'}}><i className="fa-solid fa-money-bill-trend-up"></i> Affiliate (Satış Ortaklığı) Modeli Nasıl Çalışır?</h4>
            Ziyaretçi "Mağazaya Git" butonuna tıkladığında, arka planda mağazaya özel bir takip linki (Örn: <code>?aff_id=SANA_IYI_FIYAT</code>) gönderilir. Ziyaretçi o siteden ürünü satın alırsa, satış bedelinin ortalama %5'i doğrudan <strong>SanaiyiFiyat</strong> bakiyenize yansır. Ürün satılmazsa bile CPC (Tıklama Başına Maliyet) modeliyle mağazalardan tıklama başına sabit bir ücret (Örn: 0.50 TL) tahsil edilebilir.
          </div>
          
        </div>

      </div>

      {/* Ürün Yorumları ve Değerlendirmeler (AŞAMA 5) */}
      <div style={{marginTop: '50px', padding: '30px', backgroundColor: '#1a1a1a', borderRadius: '16px'}}>
          <h2 style={{marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Kullanıcı Değerlendirmeleri</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{color: '#f5c518', fontSize: '20px'}}>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-regular fa-star-half-stroke"></i>
              </div>
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>4.5</span>
              <span style={{color: '#aaa'}}>(2 Değerlendirme)</span>
          </div>
          
          <div style={{marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{padding: '15px', backgroundColor: '#222', borderRadius: '8px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <strong>Ahmet Y.</strong> <span style={{color: '#aaa', fontSize: '12px'}}>3 gün önce</span>
                  </div>
                  <div style={{color: '#f5c518', fontSize: '12px', marginBottom: '10px'}}>
                      <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                  </div>
                  <p style={{color: '#ddd', margin: 0}}>Ürün harika, SanaiyiFiyat üzerinden en uygun satıcıyı bulup aldım, ertesi gün kargolandı.</p>
              </div>
          </div>

          <div style={{padding: '20px', backgroundColor: '#222', borderRadius: '8px', border: '1px solid #333'}}>
              <h4 style={{marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <i className="fa-regular fa-comment"></i> Yorum Ekle
              </h4>
              <textarea placeholder="Bu ürün hakkındaki düşünceleriniz nelerdir? (Yorum yapabilmek için giriş yapmalısınız)" style={{width: '100%', minHeight: '100px', padding: '15px', borderRadius: '8px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', marginBottom: '15px', fontFamily: 'inherit'}} disabled></textarea>
              <button className="compare-btn" style={{border: 'none', cursor: 'not-allowed', padding: '10px 20px', opacity: 0.5}}>Giriş Yap ve Gönder</button>
          </div>
      </div>

    </main>
  );
}
