import { prisma } from "@/lib/prisma";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, sort?: string, minPrice?: string, maxPrice?: string }> }) {
  const params = await searchParams;
  const q = params.q || "";
  const currentPage = Math.max(1, parseInt(params.page || "1"));
  const sort = params.sort || "price_asc";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  let products: any[] = [];
  let totalCount = 0;

  try {
    if (q) {
      // Toplam sonuç sayısını al (sayfalama için)
      const countResult: any[] = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT p.id) as total
        FROM Product p
        INNER JOIN Offer o ON o.productId = p.id
        WHERE p.title LIKE ${'%' + q + '%'}
        ${minPrice ? prisma.$queryRaw`AND o.price >= ${minPrice}` : prisma.$queryRaw``}
        ${maxPrice ? prisma.$queryRaw`AND o.price <= ${maxPrice}` : prisma.$queryRaw``}
      `;
      totalCount = Number(countResult[0]?.total || 0);

      // Sıralama SQL'i
      let orderClause = "ORDER BY minPrice ASC";
      if (sort === "price_desc") orderClause = "ORDER BY minPrice DESC";
      if (sort === "newest") orderClause = "ORDER BY p.updatedAt DESC";

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      const rawProducts: any[] = await prisma.$queryRaw`
        SELECT p.*, 
               (SELECT MIN(o2.price) FROM Offer o2 WHERE o2.productId = p.id) as minPrice,
               (SELECT json_object('priceText', o.priceText, 'vendor', o.vendor, 'url', o.url, 'price', o.price) 
                FROM Offer o WHERE o.productId = p.id ORDER BY o.price ASC LIMIT 1) as cheapestOfferRaw,
               (SELECT COUNT(*) FROM Offer o3 WHERE o3.productId = p.id) as sellerCount
        FROM Product p
        WHERE p.title LIKE ${'%' + q + '%'}
        ${minPrice ? prisma.$queryRaw`AND EXISTS (SELECT 1 FROM Offer ox WHERE ox.productId = p.id AND ox.price >= ${minPrice})` : prisma.$queryRaw``}
        ${maxPrice ? prisma.$queryRaw`AND EXISTS (SELECT 1 FROM Offer ox WHERE ox.productId = p.id AND ox.price <= ${maxPrice})` : prisma.$queryRaw``}
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
      `;

      products = rawProducts.map(p => ({
        ...p,
        offers: p.cheapestOfferRaw ? [JSON.parse(p.cheapestOfferRaw)] : [],
        sellerCount: Number(p.sellerCount || 1)
      }));

      // Sıralama (JS tarafında, raw query LIMIT/OFFSET ile birlikte ORDER BY sorunlarını önlemek için)
      if (sort === "price_desc") {
        products.sort((a, b) => (b.offers[0]?.price || 0) - (a.offers[0]?.price || 0));
      } else if (sort === "newest") {
        // Already sorted by DB
      } else {
        products.sort((a, b) => (a.offers[0]?.price || 0) - (b.offers[0]?.price || 0));
      }
    }
  } catch (error) {
    console.error("Arama hatası:", error);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // URL builder helper
  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sort !== "price_asc") p.set("sort", sort);
    if (minPrice) p.set("minPrice", String(minPrice));
    if (maxPrice) p.set("maxPrice", String(maxPrice));
    Object.entries(overrides).forEach(([k, v]) => p.set(k, v));
    return `/search?${p.toString()}`;
  }

  return (
    <main className="custom-container" style={{paddingTop: '20px', minHeight: '60vh'}}>
      <h2 style={{marginBottom: '5px'}}>"{q}" için arama sonuçları</h2>
      <p style={{color: '#aaa', marginBottom: '20px', fontSize: '14px'}}>{totalCount} ürün bulundu</p>

      {/* Filtre ve Sıralama Barı */}
      <div style={{display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333'}}>
        <span style={{color: '#aaa', fontSize: '14px'}}><i className="fa-solid fa-filter"></i> Filtrele:</span>
        
        <form action="/search" method="GET" style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
          <input type="hidden" name="q" value={q} />
          
          <select name="sort" defaultValue={sort} style={{padding: '8px 12px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', fontSize: '13px'}}>
            <option value="price_asc">En Ucuz</option>
            <option value="price_desc">En Pahalı</option>
            <option value="newest">En Yeni</option>
          </select>

          <input type="number" name="minPrice" placeholder="Min ₺" defaultValue={minPrice || ''} 
            style={{width: '90px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', fontSize: '13px'}} />
          <span style={{color: '#555'}}>-</span>
          <input type="number" name="maxPrice" placeholder="Max ₺" defaultValue={maxPrice || ''} 
            style={{width: '90px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', fontSize: '13px'}} />

          <button type="submit" style={{padding: '8px 16px', borderRadius: '8px', backgroundColor: '#e50914', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'}}>
            Uygula
          </button>
        </form>
      </div>
      
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
                        <div className="vendor-count">{product.sellerCount} satıcı karşılaştırılıyor</div>
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

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap'}}>
          {currentPage > 1 && (
            <Link href={buildUrl({page: String(currentPage - 1)})} style={{padding: '10px 16px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', textDecoration: 'none', border: '1px solid #444'}}>
              ← Önceki
            </Link>
          )}
          
          {Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (currentPage <= 4) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = currentPage - 3 + i;
            }
            return (
              <Link key={pageNum} href={buildUrl({page: String(pageNum)})}
                style={{padding: '10px 16px', borderRadius: '8px', backgroundColor: pageNum === currentPage ? '#e50914' : '#222', color: '#fff', textDecoration: 'none', border: pageNum === currentPage ? 'none' : '1px solid #444', fontWeight: pageNum === currentPage ? 'bold' : 'normal'}}>
                {pageNum}
              </Link>
            );
          })}
          
          {currentPage < totalPages && (
            <Link href={buildUrl({page: String(currentPage + 1)})} style={{padding: '10px 16px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', textDecoration: 'none', border: '1px solid #444'}}>
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
