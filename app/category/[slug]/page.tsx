import { prisma } from "@/lib/prisma";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;
export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string, sort?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const slug = resolvedParams.slug;
  const currentPage = Math.max(1, parseInt(resolvedSearch.page || "1"));
  const sort = resolvedSearch.sort || "price_asc";
  
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const totalCount = await prisma.product.count({ where: { category: slug } });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  let orderBy: any = {};
  if (sort === "newest") orderBy = { updatedAt: 'desc' };
  else orderBy = { title: 'asc' };

  const products = await prisma.product.findMany({
    where: { category: slug },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    orderBy,
    include: {
      offers: {
        orderBy: { price: 'asc' },
        take: 1
      },
      _count: { select: { offers: true } }
    }
  });

  // JS-side sort by price if needed
  if (sort === "price_asc") {
    products.sort((a, b) => (a.offers[0]?.price || Infinity) - (b.offers[0]?.price || Infinity));
  } else if (sort === "price_desc") {
    products.sort((a, b) => (b.offers[0]?.price || 0) - (a.offers[0]?.price || 0));
  }

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (sort !== "price_asc") p.set("sort", sort);
    Object.entries(overrides).forEach(([k, v]) => p.set(k, v));
    return `/category/${slug}?${p.toString()}`;
  }

  return (
    <main className="custom-container" style={{paddingTop: '20px', minHeight: '60vh'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>{categoryName}</span>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px'}}>
        <h2 style={{margin: 0, fontSize: '24px'}}>{categoryName} <span style={{color: '#aaa', fontSize: '16px', fontWeight: 'normal'}}>({totalCount} ürün)</span></h2>
        
        {/* Sıralama */}
        <form action={`/category/${slug}`} method="GET" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <label style={{color: '#aaa', fontSize: '14px'}}>Sırala:</label>
          <select name="sort" defaultValue={sort} onChange="this.form.submit()" style={{padding: '8px 12px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', fontSize: '13px'}}>
            <option value="price_asc">En Ucuz</option>
            <option value="price_desc">En Pahalı</option>
            <option value="newest">En Yeni</option>
          </select>
          <noscript><button type="submit" style={{padding: '8px 12px', borderRadius: '8px', backgroundColor: '#e50914', color: '#fff', border: 'none', cursor: 'pointer'}}>Uygula</button></noscript>
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
                        <span className="product-category">{categoryName}</span>
                        <h3 className="product-title">{product.title}</h3>
                        <div className="price-container">
                            <span className="current-price">{cheapestOffer.priceText}</span>
                        </div>
                        <div className="vendor-count">{product._count.offers} satıcı karşılaştırılıyor</div>
                        <Link href={`/product/${product.id}`} className="compare-btn" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>Fiyatları Kıyasla</Link>
                    </div>
                </div>
            )})
        ) : (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333'}}>
                <i className="fa-solid fa-box-open" style={{fontSize: '56px', color: '#444', marginBottom: '20px'}}></i>
                <h3 style={{fontSize: '22px', marginBottom: '10px'}}>Bu kategoride henüz ürün bulunmuyor.</h3>
                <p style={{color: '#aaa', marginBottom: '20px'}}>Çok yakında yeni ürünler eklenecektir.</p>
                <Link href="/" className="compare-btn" style={{textDecoration: 'none', display: 'inline-block'}}>Anasayfaya Dön</Link>
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
            if (totalPages <= 7) { pageNum = i + 1; }
            else if (currentPage <= 4) { pageNum = i + 1; }
            else if (currentPage >= totalPages - 3) { pageNum = totalPages - 6 + i; }
            else { pageNum = currentPage - 3 + i; }
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
