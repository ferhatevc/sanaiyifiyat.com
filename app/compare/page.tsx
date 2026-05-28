import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams;
  const idsParam = params.ids || "";
  const productIds = idsParam.split(",").filter(Boolean).slice(0, 4); // Max 4 ürün

  let products: any[] = [];

  if (productIds.length > 0) {
    products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        offers: { orderBy: { price: 'asc' }, take: 1 },
        _count: { select: { offers: true, reviews: true } }
      }
    });
  }

  return (
    <main className="custom-container" style={{paddingTop: '20px', paddingBottom: '60px', minHeight: '60vh'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>Ürün Karşılaştırma</span>
      </div>

      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '10px'}}>
        <i className="fa-solid fa-scale-balanced" style={{color: '#e50914', marginRight: '10px'}}></i>
        Ürün Karşılaştırma
      </h1>
      <p style={{color: '#aaa', marginBottom: '30px'}}>Ürünleri yan yana karşılaştırarak en doğru kararı verin.</p>

      {products.length === 0 ? (
        <div style={{textAlign: 'center', padding: '60px 20px', backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid #333'}}>
          <i className="fa-solid fa-scale-balanced" style={{fontSize: '56px', color: '#444', marginBottom: '20px', display: 'block'}}></i>
          <h3 style={{fontSize: '22px', marginBottom: '10px'}}>Henüz karşılaştırma sepetiniz boş</h3>
          <p style={{color: '#aaa', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px'}}>
            Ürün sayfalarındaki "Karşılaştır" butonuna tıklayarak ürünleri buraya ekleyebilirsiniz.
          </p>
          <Link href="/" className="compare-btn" style={{textDecoration: 'none', display: 'inline-block', padding: '14px 28px'}}>
            Ürünlere Göz At
          </Link>
        </div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: '#1a1a1a', borderRadius: '16px', overflow: 'hidden'}}>
            <thead>
              <tr>
                <th style={{padding: '20px', color: '#888', textAlign: 'left', borderBottom: '1px solid #333', width: '120px', fontSize: '14px'}}>Özellik</th>
                {products.map(product => (
                  <th key={product.id} style={{padding: '20px', borderBottom: '1px solid #333', textAlign: 'center', minWidth: '200px'}}>
                    <img src={product.image} alt={product.title} style={{width: '120px', height: '120px', objectFit: 'contain', marginBottom: '10px'}} />
                    <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#fff'}}>{product.title}</h3>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Fiyat Satırı */}
              <tr>
                <td style={{padding: '16px 20px', color: '#888', borderBottom: '1px solid #282828', fontSize: '14px'}}>
                  <i className="fa-solid fa-tag" style={{marginRight: '8px', color: '#e50914'}}></i> Fiyat
                </td>
                {products.map(product => {
                  const cheapest = product.offers[0];
                  const lowestPrice = cheapest ? cheapest.price : Infinity;
                  const isLowest = products.every(p => {
                    const cp = p.offers[0];
                    return !cp || lowestPrice <= cp.price;
                  });
                  return (
                    <td key={product.id} style={{padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #282828'}}>
                      <span style={{fontSize: '22px', fontWeight: 'bold', color: isLowest ? '#22c55e' : '#fff'}}>
                        {cheapest ? cheapest.priceText : 'N/A'}
                      </span>
                      {isLowest && <span style={{display: 'block', fontSize: '11px', color: '#22c55e', marginTop: '4px'}}>✓ En Ucuz</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Satıcı Sayısı */}
              <tr>
                <td style={{padding: '16px 20px', color: '#888', borderBottom: '1px solid #282828', fontSize: '14px'}}>
                  <i className="fa-solid fa-store" style={{marginRight: '8px', color: '#e50914'}}></i> Satıcı Sayısı
                </td>
                {products.map(product => (
                  <td key={product.id} style={{padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #282828', color: '#fff'}}>
                    {product._count.offers} satıcı
                  </td>
                ))}
              </tr>

              {/* Yorum Sayısı */}
              <tr>
                <td style={{padding: '16px 20px', color: '#888', borderBottom: '1px solid #282828', fontSize: '14px'}}>
                  <i className="fa-solid fa-comment" style={{marginRight: '8px', color: '#e50914'}}></i> Yorumlar
                </td>
                {products.map(product => (
                  <td key={product.id} style={{padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #282828', color: '#fff'}}>
                    {product._count.reviews} yorum
                  </td>
                ))}
              </tr>

              {/* Kategori */}
              <tr>
                <td style={{padding: '16px 20px', color: '#888', borderBottom: '1px solid #282828', fontSize: '14px'}}>
                  <i className="fa-solid fa-folder" style={{marginRight: '8px', color: '#e50914'}}></i> Kategori
                </td>
                {products.map(product => (
                  <td key={product.id} style={{padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #282828', color: '#fff'}}>
                    {product.category.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </td>
                ))}
              </tr>

              {/* İşlem Butonları */}
              <tr>
                <td style={{padding: '20px', color: '#888'}}></td>
                {products.map(product => (
                  <td key={product.id} style={{padding: '20px', textAlign: 'center'}}>
                    <Link href={`/product/${product.id}`} className="compare-btn" 
                      style={{textDecoration: 'none', display: 'inline-block', padding: '12px 20px', fontSize: '14px'}}>
                      Detayları Gör
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
