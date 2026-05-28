import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Sana İyi Fiyat - Alışveriş Rehberi",
  description: "En ucuz ürünleri bulma rehberleri, fiyat analizi, alışveriş ipuçları ve teknoloji haberleri. sanaiyifiyat.com Blog.",
};

export const dynamic = 'force-dynamic';

// Blog yazıları (şimdilik statik, ileride DB'ye taşınabilir)
const blogPosts = [
  {
    slug: "fiyat-karsilastirma-neden-onemli",
    title: "Fiyat Karşılaştırma Neden Önemli? Yılda Binlerce TL Tasarruf Edin",
    excerpt: "Aynı ürün farklı mağazalarda farklı fiyatlarla satılıyor. Fiyat karşılaştırma ile yılda ortalama 3.000-5.000 TL tasarruf edebilirsiniz.",
    category: "Rehber",
    date: "2026-05-28",
    readTime: "5 dk",
    icon: "fa-solid fa-piggy-bank"
  },
  {
    slug: "en-ucuz-iphone-nereden-alinir",
    title: "2026'da En Ucuz iPhone Nereden Alınır? Mağaza Karşılaştırması",
    excerpt: "iPhone 15, 16 ve SE modelleri için Trendyol, Hepsiburada, Amazon ve Apple Store fiyatlarını karşılaştırdık.",
    category: "Karşılaştırma",
    date: "2026-05-28",
    readTime: "7 dk",
    icon: "fa-brands fa-apple"
  },
  {
    slug: "black-friday-2026-rehberi",
    title: "Black Friday 2026 Rehberi: En İyi Fırsatları Kaçırmayın",
    excerpt: "Black Friday'de gerçekten indirim olan ürünleri sahte indirimlerden nasıl ayırırsınız? Fiyat geçmişi grafiği ile kontrol edin.",
    category: "Rehber",
    date: "2026-05-28",
    readTime: "6 dk",
    icon: "fa-solid fa-tags"
  },
  {
    slug: "laptop-alirken-dikkat",
    title: "Laptop Alırken Nelere Dikkat Edilmeli? 2026 Alım Rehberi",
    excerpt: "İşlemci, RAM, SSD, ekran boyutu... Bütçenize göre en uygun laptop nasıl seçilir? Detaylı karşılaştırma rehberi.",
    category: "Rehber",
    date: "2026-05-28",
    readTime: "8 dk",
    icon: "fa-solid fa-laptop"
  },
  {
    slug: "sahte-indirim-nasil-anlasilir",
    title: "Sahte İndirim Nasıl Anlaşılır? 5 Altın Kural",
    excerpt: "Mağazalar fiyatı önce yükseltip sonra 'indirim' yapıyor olabilir. Fiyat geçmişi grafiği ile gerçek indirimi bulun.",
    category: "İpucu",
    date: "2026-05-28",
    readTime: "4 dk",
    icon: "fa-solid fa-shield-halved"
  }
];

export default function BlogPage() {
  return (
    <main className="custom-container" style={{paddingTop: '20px', paddingBottom: '60px', minHeight: '60vh'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
        <Link href="/" style={{color: '#aaa', textDecoration: 'none'}}><i className="fa-solid fa-house"></i></Link>
        <span style={{color: '#555'}}>/</span>
        <span style={{color: '#e50914', fontWeight: 'bold'}}>Blog</span>
      </div>

      <div style={{marginBottom: '40px'}}>
        <h1 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '8px'}}>
          <i className="fa-solid fa-newspaper" style={{color: '#e50914', marginRight: '10px'}}></i>
          Alışveriş Rehberi & Blog
        </h1>
        <p style={{color: '#aaa', fontSize: '15px'}}>En ucuz ürünleri bulma rehberleri, fiyat analizi ve alışveriş ipuçları.</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px'}}>
        {blogPosts.map(post => (
          <Link href={`/blog/${post.slug}`} key={post.slug} style={{textDecoration: 'none', color: 'inherit'}}>
            <article style={{
              backgroundColor: '#fff', borderRadius: '16px', padding: '28px',
              border: '1px solid #e0e0e0', transition: 'all 0.3s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
                <span style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: 'rgba(229,9,20,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#e50914'
                }}>
                  <i className={post.icon}></i>
                </span>
                <div>
                  <span style={{fontSize: '12px', color: '#e50914', fontWeight: '600'}}>{post.category}</span>
                  <div style={{fontSize: '12px', color: '#999'}}>{post.date} • {post.readTime} okuma</div>
                </div>
              </div>
              <h2 style={{fontSize: '18px', fontWeight: '700', marginBottom: '12px', lineHeight: '1.4', color: '#121212'}}>{post.title}</h2>
              <p style={{fontSize: '14px', color: '#666', lineHeight: '1.6', flex: 1}}>{post.excerpt}</p>
              <div style={{marginTop: '16px', color: '#e50914', fontSize: '14px', fontWeight: '600'}}>
                Devamını Oku <i className="fa-solid fa-arrow-right" style={{marginLeft: '5px'}}></i>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
