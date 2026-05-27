import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic'; // Next.js önbelleğini (cache) kapatır, her yenilemede canlı veri çeker

export default async function Home() {
  // Veritabanından (Ana Ürünler ve onların en ucuz tekliflerini) çekiyoruz
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      include: {
        offers: {
          orderBy: { price: "asc" },
          take: 1 // Sadece en ucuz teklifi al
        }
      },
      take: 8
    });
  } catch (error) {
    console.error("Veritabanı okuma hatası:", error);
  }

  return (
      <main className="custom-container" style={{paddingTop: '20px'}}>
          <section className="hero-section">
              <div className="hero-content">
                  <h1>Aradığın ürün için <br /><span className="highlight-text">en iyi fiyatı</span> bul.</h1>
                  <p>Binlerce satıcıdaki fiyatları saniyeler içinde karşılaştır, fazladan para ödeme.</p>
                  
                  <div className="popular-searches">
                      <span>Popüler Aramalar:</span>
                      <Link href="#" className="badge">Airfryer</Link>
                      <Link href="#" className="badge">iPhone 15 Pro</Link>
                      <Link href="#" className="badge">Robot Süpürge</Link>
                      <Link href="#" className="badge">PS5</Link>
                  </div>
              </div>
          </section>

          <section className="categories-section">
              <h2>Kategoriler</h2>
              <div className="categories-grid">
                  <Link href="/category/cep-telefonu" style={{textDecoration: 'none'}}>
                      <div className="category-card">
                          <div className="cat-icon"><i className="fa-solid fa-mobile-screen"></i></div>
                          <h3>Telefon & Aksesuar</h3>
                      </div>
                  </Link>
                  <Link href="/category/bilgisayar" style={{textDecoration: 'none'}}>
                      <div className="category-card">
                          <div className="cat-icon"><i className="fa-solid fa-laptop"></i></div>
                          <h3>Bilgisayar</h3>
                      </div>
                  </Link>
                  <Link href="/category/ev-aletleri" style={{textDecoration: 'none'}}>
                      <div className="category-card">
                          <div className="cat-icon"><i className="fa-solid fa-blender"></i></div>
                          <h3>Ev Aletleri</h3>
                      </div>
                  </Link>
                  <Link href="/category/giyim" style={{textDecoration: 'none'}}>
                      <div className="category-card">
                          <div className="cat-icon"><i className="fa-solid fa-shirt"></i></div>
                          <h3>Giyim & Moda</h3>
                      </div>
                  </Link>
                  <Link href="/category/oto-sanayi" style={{textDecoration: 'none'}}>
                      <div className="category-card">
                          <div className="cat-icon"><i className="fa-solid fa-car"></i></div>
                          <h3>Oto & Sanayi</h3>
                      </div>
                  </Link>
                  <Link href="/category/ev-yasam" style={{textDecoration: 'none'}}>
                      <div className="category-card">
                          <div className="cat-icon"><i className="fa-solid fa-couch"></i></div>
                          <h3>Ev & Yaşam</h3>
                      </div>
                  </Link>
              </div>
          </section>

          <section className="trending-section">
              <h2>Günün Öne Çıkan Fırsatları (Canlı Veri)</h2>
              <div className="products-grid">
                  {products.length > 0 ? (
                      products.map((product: any, index: number) => {
                          const cheapestOffer = product.offers?.[0];
                          if (!cheapestOffer) return null;
                          return (
                          <div className="product-card" key={index}>
                              <div className="discount-badge">En Ucuz</div>
                              <img src={product.image} alt={product.title} className="product-img" />
                              <div className="product-info">
                                  <span className="product-category">Yeni Ürün</span>
                                  <h3 className="product-title">{product.title}</h3>
                                  <div className="price-container">
                                      <span className="current-price">{cheapestOffer.priceText}</span>
                                  </div>
                                  <div className="vendor-count">Satıcı: {cheapestOffer.vendor}</div>
                                  <Link href={`/product/${product.id}`} className="compare-btn" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>Fiyatları Kıyasla</Link>
                              </div>
                          </div>
                      )})
                  ) : (
                      <p>Ürünler yükleniyor veya bot çalıştırılmadı...</p>
                  )}
              </div>
          </section>
      </main>
  );
}
