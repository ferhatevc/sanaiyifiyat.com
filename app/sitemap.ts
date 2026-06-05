import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const baseUrl = 'https://sanaiyifiyat.com';
const PRODUCTS_PER_SITEMAP = 45000; // Google max 50K, güvenli sınır

// Next.js otomatik olarak /sitemap/0.xml, /sitemap/1.xml ... oluşturur
export async function generateSitemaps() {
  const count = await prisma.product.count();
  const numSitemaps = Math.ceil(count / PRODUCTS_PER_SITEMAP);
  
  // id: 0 → statik sayfalar + kategoriler + markalar
  // id: 1-N → ürün sayfaları
  return Array.from({ length: numSitemaps + 1 }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  
  // id: 0 → Ana sayfalar, kategoriler, markalar
  if (id === 0) {
    const sitemapData: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ];

    try {
      // Kategoriler
      const categories = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
      categories.forEach((cat) => {
        sitemapData.push({
          url: `${baseUrl}/category/${cat.category}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      });

      // Markalar (en popüler 500 marka)
      const brands = await prisma.product.groupBy({
        by: ['brand'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 500,
        where: { brand: { not: '' } },
      });
      brands.forEach((b) => {
        if (b.brand && b.brand.length > 1) {
          sitemapData.push({
            url: `${baseUrl}/brand/${encodeURIComponent(b.brand.toLowerCase().replace(/\s+/g, '-'))}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });

      // Popüler arama sayfaları
      const searches = [
        'iphone', 'samsung', 'laptop', 'tablet', 'airfryer', 'televizyon', 
        'kulaklık', 'robot-süpürge', 'bulaşık-makinesi', 'çamaşır-makinesi',
        'monitör', 'kamera', 'drone', 'playstation', 'xbox', 'nintendo',
        'parfüm', 'güneş-gözlüğü', 'saat', 'çanta', 'ayakkabı',
        'kahve-makinesi', 'elektrikli-süpürge', 'klima', 'buzdolabı',
      ];
      searches.forEach(q => {
        sitemapData.push({
          url: `${baseUrl}/en-ucuz/${q}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.85,
        });
      });
    } catch (e) {
      console.error("Sitemap kategoriler hatası:", e);
    }

    return sitemapData;
  }

  // id: 1-N → Ürün sayfaları (her biri 45K ürün)
  const productSitemapIndex = id - 1; // 0-indexed for products
  try {
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: productSitemapIndex * PRODUCTS_PER_SITEMAP,
      take: PRODUCTS_PER_SITEMAP,
    });

    return products.map((prod) => ({
      url: `${baseUrl}/product/${prod.id}`,
      lastModified: prod.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error(`Sitemap ${id} hatası:`, e);
    return [];
  }
}
