import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';


const baseUrl = 'https://sanaiyifiyat.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];

  try {
    // Kategorileri veritabanından çek ve haritaya ekle
    const categoriesRaw = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
    const categories = categoriesRaw.map(c => ({ slug: c.category }));
    categories.forEach((cat) => {
      sitemapData.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });

    // En yeni 1000 ürünü veritabanından çek ve haritaya ekle 
    // (Sunucunun 50.000 üründe yorulmaması ve çökmemesi için en güncel 1000 ürün indexlenir)
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });
    
    products.forEach((prod) => {
      sitemapData.push({
        url: `${baseUrl}/product/${prod.id}`,
        lastModified: prod.updatedAt,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });

    // Marka sayfalarını ekle
    const brands = await prisma.product.findMany({ select: { brand: true }, distinct: ['brand'] });
    brands.forEach((b) => {
      if (b.brand && b.brand.length > 1) {
        sitemapData.push({
          url: `${baseUrl}/brand/${b.brand.toLowerCase().replace(/\s+/g, '-')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });

    // Popüler "en ucuz" sayfalarını ekle
    const popularSearches = ['iphone', 'samsung', 'laptop', 'tablet', 'airfryer', 'televizyon', 'kulaklık', 'robot-süpürge', 'bulaşık-makinesi', 'çamaşır-makinesi'];
    popularSearches.forEach(q => {
      sitemapData.push({
        url: `${baseUrl}/en-ucuz/${q}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      });
    });
  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error);
  }

  return sitemapData;
}
