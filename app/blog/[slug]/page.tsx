import Link from "next/link";
import type { Metadata } from "next";

// Blog yazıları veritabanı (statik)
const posts: Record<string, any> = {
  "fiyat-karsilastirma-neden-onemli": {
    title: "Fiyat Karşılaştırma Neden Önemli? Yılda Binlerce TL Tasarruf Edin",
    category: "Rehber", date: "28 Mayıs 2026", readTime: "5 dk",
    content: `
      <h2>Aynı Ürün, Farklı Fiyat</h2>
      <p>Türkiye'de aynı ürünün farklı mağazalardaki fiyat farkı <strong>%15 ile %40</strong> arasında değişebiliyor. Örneğin bir iPhone 15, bir mağazada 42.000 TL iken diğerinde 38.500 TL olabiliyor. Bu fark <strong>3.500 TL!</strong></p>
      <h2>Yılda Ne Kadar Tasarruf Edilir?</h2>
      <p>Ortalama bir aile yılda 50.000-100.000 TL arası online alışveriş yapıyor. Her alışverişte sadece <strong>%10 tasarruf</strong> etsek bile, bu yılda <strong>5.000-10.000 TL</strong> demek!</p>
      <h2>Fiyat Geçmişi Neden Önemli?</h2>
      <p>Bazı mağazalar "indirim" öncesi fiyatı yükseltiyor. <strong>sanaiyifiyat.com</strong>'daki fiyat geçmişi grafiği ile ürünün gerçekten ucuzlayıp ucuzlamadığını görebilirsiniz.</p>
      <h2>AI Fiyat Tahmini ile Doğru Zamanda Alın</h2>
      <p>Yapay zeka destekli fiyat tahmin sistemimiz, ürünün fiyatının düşüp düşmeyeceğini analiz eder. "Şimdi al" veya "Biraz bekle" önerisi ile paranızı korumanıza yardımcı olur.</p>
    `
  },
  "en-ucuz-iphone-nereden-alinir": {
    title: "2026'da En Ucuz iPhone Nereden Alınır? Mağaza Karşılaştırması",
    category: "Karşılaştırma", date: "28 Mayıs 2026", readTime: "7 dk",
    content: `
      <h2>iPhone Fiyatları Neden Bu Kadar Farklı?</h2>
      <p>Apple ürünlerinin Türkiye'deki fiyatları mağazadan mağazaya ciddi farklılık gösterir. Bunun sebepleri: döviz kuru farkları, kampanyalar, stok durumu ve satıcı marjı.</p>
      <h2>Nereden Almalı?</h2>
      <p><strong>Trendyol:</strong> Genellikle en agresif fiyatları sunar. Süper indirim günlerinde ekstra avantaj.</p>
      <p><strong>Hepsiburada:</strong> Hepsipay ile taksit avantajı. Premium üyelikle ekstra indirim.</p>
      <p><strong>Amazon TR:</strong> Prime üyelikle hızlı kargo + bazen en ucuz fiyat.</p>
      <p><strong>Apple Store:</strong> Garanti avantajı var ama genellikle en pahalı.</p>
      <h2>En İyi Yöntem</h2>
      <p><a href="https://sanaiyifiyat.com/en-ucuz/iphone">sanaiyifiyat.com/en-ucuz/iphone</a> adresinden tüm mağazaları anlık olarak karşılaştırabilir, fiyat alarmı kurarak düşüş anında bildirim alabilirsiniz.</p>
    `
  },
  "black-friday-2026-rehberi": {
    title: "Black Friday 2026 Rehberi: En İyi Fırsatları Kaçırmayın",
    category: "Rehber", date: "28 Mayıs 2026", readTime: "6 dk",
    content: `
      <h2>Black Friday Ne Zaman?</h2>
      <p>Black Friday 2026, <strong>27 Kasım 2026 Cuma</strong> günü. Ancak çoğu mağaza 1 hafta öncesinden kampanya başlatıyor.</p>
      <h2>Sahte İndirimlerden Korunun</h2>
      <p>Araştırmalar gösteriyor ki Black Friday'deki "indirimlerin" <strong>%40'ı sahte</strong>. Mağazalar ürün fiyatını Ekim'de yükseltip Kasım'da "indirim" yapıyor.</p>
      <p><strong>Çözüm:</strong> sanaiyifiyat.com'daki fiyat geçmişi grafiği ile ürünün son 6 aylık fiyat hareketini kontrol edin!</p>
      <h2>En Çok İndirim Yapılan Kategoriler</h2>
      <p>Elektronik (%20-40), Küçük ev aletleri (%30-50), Giyim (%40-60), Kozmetik (%20-30). Bu kategorilerde gerçek fırsat yakalama şansınız yüksek.</p>
    `
  },
  "laptop-alirken-dikkat": {
    title: "Laptop Alırken Nelere Dikkat Edilmeli? 2026 Alım Rehberi",
    category: "Rehber", date: "28 Mayıs 2026", readTime: "8 dk",
    content: `
      <h2>Kullanım Amacınızı Belirleyin</h2>
      <p><strong>Ofis/Öğrenci:</strong> i5/Ryzen 5 + 8GB RAM + 256GB SSD yeterli. Bütçe: 15.000-25.000 TL</p>
      <p><strong>Tasarım/Video:</strong> i7/Ryzen 7 + 16GB RAM + 512GB SSD. Bütçe: 30.000-50.000 TL</p>
      <p><strong>Oyun:</strong> i7/Ryzen 7 + 16GB RAM + RTX 4060+. Bütçe: 40.000-80.000 TL</p>
      <h2>Marka Karşılaştırması</h2>
      <p><strong>Lenovo:</strong> Fiyat/performans kralı. IdeaPad ve ThinkPad serileri güvenilir.</p>
      <p><strong>ASUS:</strong> Oyun laptoplarında güçlü. VivoBook serisi öğrenciler için ideal.</p>
      <p><strong>HP:</strong> İş dünyasında güvenilir. Pavilion serisi çok yönlü.</p>
      <p><strong>Apple MacBook:</strong> macOS isteyenler için. Batarya ömrü en iyi.</p>
      <h2>En Ucuz Fiyatı Bulun</h2>
      <p><a href="https://sanaiyifiyat.com/en-ucuz/laptop">sanaiyifiyat.com'da laptop fiyatlarını karşılaştırın →</a></p>
    `
  },
  "sahte-indirim-nasil-anlasilir": {
    title: "Sahte İndirim Nasıl Anlaşılır? 5 Altın Kural",
    category: "İpucu", date: "28 Mayıs 2026", readTime: "4 dk",
    content: `
      <h2>1. Fiyat Geçmişini Kontrol Edin</h2>
      <p>Ürünün son 3-6 aylık fiyat grafiğine bakın. İndirim öncesi fiyat artışı varsa, indirim sahte olabilir.</p>
      <h2>2. Birden Fazla Mağazada Karşılaştırın</h2>
      <p>Sadece bir mağazanın "indirimli" fiyatına güvenmeyin. sanaiyifiyat.com'da tüm mağazaları yan yana görün.</p>
      <h2>3. "İndirim Oranı"na Değil, Final Fiyata Bakın</h2>
      <p>"%70 indirim" yazıyor olabilir ama ürünün piyasa değeri zaten o fiyat olabilir.</p>
      <h2>4. Acele Ettiren Zamanlayıcılara Kanmayın</h2>
      <p>"Son 2 saat!" gibi baskı yapan sayaçlar genellikle yapay aciliyet yaratır.</p>
      <h2>5. AI Fiyat Tahminini Kullanın</h2>
      <p>sanaiyifiyat.com'daki yapay zeka, ürünün gerçekten ucuz olup olmadığını analiz eder ve size "Al" veya "Bekle" önerisi sunar.</p>
    `
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Yazı Bulunamadı" };
  return {
    title: `${post.title} | Sana İyi Fiyat Blog`,
    description: post.content.replace(/<[^>]*>/g, '').substring(0, 160),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <main className="custom-container" style={{paddingTop: '40px', minHeight: '60vh', textAlign: 'center'}}>
        <h1>Yazı Bulunamadı</h1>
        <Link href="/blog" className="compare-btn" style={{display: 'inline-block', marginTop: '20px', textDecoration: 'none'}}>Blog'a Dön</Link>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": "2026-05-28",
    "author": { "@type": "Organization", "name": "Sana İyi Fiyat" },
    "publisher": { "@type": "Organization", "name": "Sana İyi Fiyat", "logo": { "@type": "ImageObject", "url": "https://sanaiyifiyat.com/icon-512x512.png" }}
  };

  return (
    <main className="custom-container" style={{paddingTop: '20px', paddingBottom: '60px', minHeight: '60vh'}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />

      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <Link href="/blog" style={{color: '#aaa', textDecoration: 'none'}}>Blog</Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>{post.category}</span>
      </div>

      <article style={{maxWidth: '720px'}}>
        <span style={{fontSize: '13px', color: '#e50914', fontWeight: '600'}}>{post.category}</span>
        <h1 style={{fontSize: '32px', fontWeight: '800', lineHeight: '1.3', marginTop: '8px', marginBottom: '16px'}}>{post.title}</h1>
        <div style={{fontSize: '14px', color: '#888', marginBottom: '30px', display: 'flex', gap: '15px'}}>
          <span><i className="fa-regular fa-calendar"></i> {post.date}</span>
          <span><i className="fa-regular fa-clock"></i> {post.readTime} okuma</span>
        </div>

        <div style={{fontSize: '16px', lineHeight: '1.8', color: '#333'}} dangerouslySetInnerHTML={{__html: post.content}} />

        <div style={{marginTop: '40px', padding: '24px', backgroundColor: 'rgba(229,9,20,0.05)', borderRadius: '12px', border: '1px solid rgba(229,9,20,0.2)'}}>
          <h3 style={{color: '#e50914', marginBottom: '10px', fontSize: '18px'}}>🔍 Fiyat Karşılaştır, Tasarruf Et!</h3>
          <p style={{color: '#666', marginBottom: '15px', fontSize: '14px'}}>Binlerce ürünün en ucuz fiyatını saniyeler içinde bulun.</p>
          <Link href="/" className="compare-btn" style={{textDecoration: 'none', display: 'inline-block', padding: '12px 24px'}}>
            Hemen Karşılaştır <i className="fa-solid fa-arrow-right" style={{marginLeft: '8px'}}></i>
          </Link>
        </div>
      </article>
    </main>
  );
}
