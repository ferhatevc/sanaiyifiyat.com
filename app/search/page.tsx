import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  let products = [];
  try {
    if (q) {
      // 50.000 ürün ekleneceği için artık tüm tabloyu RAM'e çekip filtreleyemeyiz (Sunucu Çöker).
      // Bu yüzden veritabanı seviyesinde, büyük/küçük harf duyarsız (Case-Insensitive) çalışan Raw SQL atıyoruz.
      const rawProducts: any[] = await prisma.$queryRaw`
        SELECT p.*, 
               (SELECT json_object('priceText', o.priceText, 'vendor', o.vendor, 'url', o.url) 
                FROM Offer o WHERE o.productId = p.id ORDER BY o.price ASC LIMIT 1) as cheapestOfferRaw
        FROM Product p
        WHERE p.title LIKE ${'%' + q + '%'}
        LIMIT 40
      `;

      // Ön yüzün (Frontend) beklediği formata geri dönüştürüyoruz
      products = rawProducts.map(p => ({
          ...p,
          offers: p.cheapestOfferRaw ? [JSON.parse(p.cheapestOfferRaw)] : []
      }));
    }
  } catch (error) {
    console.error("Arama hatası:", error);
  }

  return (
    <main className="custom-container" style={{paddingTop: '20px', minHeight: '60vh'}}>
      <h2 style={{marginBottom: '20px'}}>"{q}" için arama sonuçları ({products.length} ürün bulundu)</h2>
      
      <div className="products-grid">
        {products.length > 0 ? (
            products.map((product: any, index: number) => {
                const cheapestOffer = product.offers?.[0];
                if (!cheapestOffer) return null;
                return (
                <div className="product-card" key={index}>
                    <img src={product.image} alt={product.title} className="product-img" />
                    <div className="product-info">
                        <span className="product-category">Arama Sonucu</span>
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
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#1a1a1a', borderRadius: '12px'}}>
                <i className="fa-solid fa-magnifying-glass" style={{fontSize: '48px', color: '#666', marginBottom: '20px'}}></i>
                <p style={{fontSize: '18px', color: '#aaa'}}>Aradığınız kritere uygun ürün bulunamadı. Lütfen "Telefon" veya "Samsung" gibi daha genel kelimeler deneyin.</p>
            </div>
        )}
      </div>
    </main>
  );
}
