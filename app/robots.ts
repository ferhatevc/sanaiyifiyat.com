import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Admin panelinin ve API'lerin Google tarafından indexlenmesini engeller
    },
    sitemap: 'https://sanaiyifiyat.com/sitemap.xml', // Google'a sitemap adresini bildirir
  };
}
