import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/profile', '/brief', '/link-telegram', '/api'],
      },
    ],
    sitemap: 'https://lighted.life/sitemap.xml',
  };
}
