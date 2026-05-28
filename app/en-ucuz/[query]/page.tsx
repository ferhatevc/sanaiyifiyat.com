import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ query: string }> }): Promise<Metadata> {
  const { query } = await params;
  const queryText = decodeURIComponent(query).replace(/-/g, ' ');
  return {
    title: `En Ucuz ${queryText} Fiyatları 2026 | Sana İyi Fiyat`,
    description: `En ucuz ${queryText} nerede satılıyor? ${queryText} fiyat karşılaştırma. Türkiye'nin tüm mağazalarından en uygun ${queryText} fiyatları.`,
  };
}

export default async function EnUcuzPage({ params }: { params: Promise<{ query: string }> }) {
  const { query } = await params;
  const queryText = decodeURIComponent(query).replace(/-/g, ' ');

  const products = await prisma.product.findMany({
    where: { title: { contains: queryText } },
    take: 20,
    include: {
      offers: { orderBy: { price: 'asc' }, take: 1 },
      _count: { select: { offers: true } }
    }
  });

  // Fiyata göre sırala
  products.sort((a, b) => (a.offers[0]?.price || Infinity) - (b.offers[0]?.price || Infinity));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `En Ucuz ${queryText} Fiyatları`,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": p.title,
        "image": p.image,
        "offers": {
          "@type": "Offer",
          "price": p.offers[0]?.price || 0,
          "priceCurrency": "TRY"
        }
      }
    }))
  };

  return (
    <main className="custom-container" style={{paddingTop: '20px', minHeight: '60vh'}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />

      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>En Ucuz {queryText}</span>
      </div>

      <div style={{marginBottom: '30px'}}>
        <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '8px'}}>
          <i className="fa-solid fa-fire" style={{color: '#e50914', marginRight: '10px'}}></i>
          En Ucuz {queryText} Fiyatları (2026)
        </h1>
        <p style={{color: '#aaa', fontSize: '14px'}}>
          {products.length} ürün arasından en uygun fiyatlı {queryText} modelleri. Fiyatlar anlık olarak güncellenmektedir.
        </p>
      </div>

      {/* En Ucuz Ürün Highlight */}
      {products.length > 0 && products[0].offers[0] && (
        <div style={{padding: '24px', backgroundColor: '#1a1a1a', borderRadius: '16px', border: '2px solid #e50914', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
          <img src={products[0].image} alt={products[0].title} style={{width: '100px', height: '100px', objectFit: 'contain'}} />
          <div style={{flex: 1, minWidth: '200px'}}>
            <span style={{fontSize: '12px', color: '#e50914', fontWeight: 'bold'}}>🏆 EN UCUZ</span>
            <h2 style={{fontSize: '18px', margin: '5px 0'}}>{products[0].title}</h2>
            <span style={{fontSize: '28px', fontWeight: 'bold', color: '#22c55e'}}>{products[0].offers[0].priceText}</span>
            <span style={{color: '#888', marginLeft: '10px', fontSize: '14px'}}>{products[0]._count.offers} satıcıda</span>
          </div>
          <Link href={`/product/${products[0].id}`} className="compare-btn" style={{textDecoration: 'none', padding: '14px 28px', whiteSpace: 'nowrap'}}>
            Fiyatları Gör
          </Link>
        </div>
      )}

      <div className="products-grid">
        {products.slice(1).map((product: any) => {
          const cheapestOffer = product.offers?.[0];
          if (!cheapestOffer) return null;
          return (
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.title} className="product-img" />
              <div className="product-info">
                <span className="product-category">En Ucuz</span>
                <h3 className="product-title">{product.title}</h3>
                <div className="price-container">
                  <span className="current-price">{cheapestOffer.priceText}</span>
                </div>
                <div className="vendor-count">{product._count.offers} satıcı</div>
                <Link href={`/product/${product.id}`} className="compare-btn" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>Fiyatları Kıyasla</Link>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div style={{textAlign: 'center', padding: '60px', backgroundColor: '#1a1a1a', borderRadius: '12px'}}>
          <i className="fa-solid fa-search" style={{fontSize: '48px', color: '#444', marginBottom: '20px', display: 'block'}}></i>
          <h3>"{queryText}" için ürün bulunamadı.</h3>
          <p style={{color: '#aaa', marginTop: '10px'}}>Farklı bir arama terimi deneyin.</p>
          <Link href="/" className="compare-btn" style={{textDecoration: 'none', display: 'inline-block', marginTop: '20px'}}>Anasayfaya Dön</Link>
        </div>
      )}
    </main>
  );
}
