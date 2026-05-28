import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;

// Dinamik SEO meta verileri
export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const brandName = decodeURIComponent(brand).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${brandName} Ürünleri Fiyat Karşılaştırma | Sana İyi Fiyat`,
    description: `${brandName} ürünlerinin en ucuz fiyatlarını karşılaştırın. ${brandName} fiyat karşılaştırma, en uygun fiyat garantisi.`,
  };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ brand: string }>, searchParams: Promise<{ page?: string }> }) {
  const { brand } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const brandName = decodeURIComponent(brand).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Marka adını ürün başlığında ara
  const totalCount = await prisma.product.count({
    where: { title: { contains: brandName } }
  });

  const products = await prisma.product.findMany({
    where: { title: { contains: brandName } },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    include: {
      offers: { orderBy: { price: 'asc' }, take: 1 },
      _count: { select: { offers: true } }
    }
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="custom-container" style={{paddingTop: '20px', minHeight: '60vh'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>{brandName}</span>
      </div>

      <div style={{marginBottom: '30px'}}>
        <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '5px'}}>
          {brandName} Ürünleri
        </h1>
        <p style={{color: '#aaa', fontSize: '14px'}}>{totalCount} ürün listeleniyor • En ucuz fiyat karşılaştırması</p>
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product: any) => {
            const cheapestOffer = product.offers?.[0];
            if (!cheapestOffer) return null;
            return (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.title} className="product-img" />
                <div className="product-info">
                  <span className="product-category">{brandName}</span>
                  <h3 className="product-title">{product.title}</h3>
                  <div className="price-container">
                    <span className="current-price">{cheapestOffer.priceText}</span>
                  </div>
                  <div className="vendor-count">{product._count.offers} satıcı karşılaştırılıyor</div>
                  <Link href={`/product/${product.id}`} className="compare-btn" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>Fiyatları Kıyasla</Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: '#1a1a1a', borderRadius: '12px'}}>
            <i className="fa-solid fa-tag" style={{fontSize: '48px', color: '#444', marginBottom: '20px', display: 'block'}}></i>
            <h3>"{brandName}" markasında henüz ürün bulunamadı.</h3>
            <p style={{color: '#aaa', marginTop: '10px'}}>Farklı bir marka deneyin veya arama yapın.</p>
            <Link href="/" className="compare-btn" style={{textDecoration: 'none', display: 'inline-block', marginTop: '20px'}}>Anasayfaya Dön</Link>
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap'}}>
          {currentPage > 1 && (
            <Link href={`/brand/${brand}?page=${currentPage - 1}`} style={{padding: '10px 16px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', textDecoration: 'none', border: '1px solid #444'}}>← Önceki</Link>
          )}
          {Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
            const pageNum = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage >= totalPages - 3 ? totalPages - 6 + i : currentPage - 3 + i;
            return (
              <Link key={pageNum} href={`/brand/${brand}?page=${pageNum}`}
                style={{padding: '10px 16px', borderRadius: '8px', backgroundColor: pageNum === currentPage ? '#e50914' : '#222', color: '#fff', textDecoration: 'none', border: pageNum === currentPage ? 'none' : '1px solid #444', fontWeight: pageNum === currentPage ? 'bold' : 'normal'}}>
                {pageNum}
              </Link>
            );
          })}
          {currentPage < totalPages && (
            <Link href={`/brand/${brand}?page=${currentPage + 1}`} style={{padding: '10px 16px', borderRadius: '8px', backgroundColor: '#222', color: '#fff', textDecoration: 'none', border: '1px solid #444'}}>Sonraki →</Link>
          )}
        </div>
      )}
    </main>
  );
}
