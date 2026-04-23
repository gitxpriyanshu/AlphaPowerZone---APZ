import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const getSitemap = asyncHandler(async (req, res) => {
    const baseUrl = process.env.FRONTEND_URL || 'https://alphapowerzone.com';
    // Fetch dynamic data
    const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
    const categories = await prisma.category.findMany({ select: { slug: true } });
    const staticPages = [
        '',
        '/shop',
        '/fitness',
        '/tracker',
        '/about',
        '/contact'
    ];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    // Static Pages
    staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    // Categories
    categories.forEach(cat => {
        xml += `  <url>\n    <loc>${baseUrl}/shop/${cat.slug}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
    });
    // Products
    products.forEach(prod => {
        xml += `  <url>\n    <loc>${baseUrl}/product/${prod.slug}</loc>\n    <lastmod>${prod.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
    });
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
});
