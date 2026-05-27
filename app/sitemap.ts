import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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
    const categories = await prisma.category.findMany({ select: { slug: true } });
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
  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error);
  }

  return sitemapData;
}
