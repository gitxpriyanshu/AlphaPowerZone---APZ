import prisma from '../config/database.js';
export const productService = {
    /**
     * Advanced product search and filtering
     */
    getProducts: async (query) => {
        const { search, category, minPrice, maxPrice, minRating, inStock, isFeatured, sort, page = '1', limit = '12', admin = 'false' } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        // Build where clause
        const where = {
            isActive: admin === 'true' ? undefined : true,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }
        if (category && category.trim()) {
            const slugs = category.split(',').map(s => s.trim()).filter(Boolean);
            if (slugs.length === 1) {
                where.category = { slug: slugs[0] };
            }
            else if (slugs.length > 1) {
                where.category = { slug: { in: slugs } };
            }
        }
        if (minPrice || maxPrice) {
            where.price = {
                gte: minPrice ? parseFloat(minPrice) : undefined,
                lte: maxPrice ? parseFloat(maxPrice) : undefined,
            };
        }
        if (minRating) {
            where.avgRating = { gte: parseFloat(minRating) };
        }
        if (inStock === 'true') {
            where.stock = { gt: 0 };
        }
        if (isFeatured === 'true') {
            where.isFeatured = true;
        }
        // Build orderBy
        let orderBy = { createdAt: 'desc' };
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { price: 'desc' };
                    break;
                case 'newest':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'rating':
                    orderBy = { avgRating: 'desc' };
                    break;
                case 'popular':
                    orderBy = { reviewCount: 'desc' };
                    break;
            }
        }
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy,
                skip,
                take,
            }),
            prisma.product.count({ where }),
        ]);
        const totalPages = Math.ceil(total / take);
        return {
            products,
            total,
            page: parseInt(page),
            totalPages,
            hasNext: parseInt(page) < totalPages,
        };
    },
};
