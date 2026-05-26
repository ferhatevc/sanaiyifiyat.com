import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Build sırasında veritabanı sorgusu yapmasını engeller

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Örn: "cep-telefonu" slugını okunaklı başlığa çevir (Cep Telefonu)
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const products = await prisma.product.findMany({
    where: { category: slug },
    take: 40, // 50.000 ürünü aynı anda ekrana basıp tarayıcıyı çökertmemek için sayfalama (limit) koyduk
    include: {
      offers: {
        orderBy: { price: 'asc' },
        take: 1
      }
    }
  });

  return (
    <main className="custom-container" style={{paddingTop: '20px', minHeight: '60vh'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>{categoryName}</span>
      </div>

      <h2 style={{marginBottom: '30px', fontSize: '28px'}}>{categoryName} Modelleri ve Fiyatları ({products.length} ürün)</h2>
      
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
                        <div className="vendor-count">Satıcı: {cheapestOffer.vendor}</div>
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
    </main>
  );
}
