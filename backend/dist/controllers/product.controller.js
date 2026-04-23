import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { productService } from '../services/product.service.js';
/**
 * Get all products with advanced filtering and search
 */
export const getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);
    return res.status(200).json(new ApiResponse(200, result, 'Products fetched successfully'));
});
/**
 * Get product by slug
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            reviews: {
                include: {
                    user: {
                        select: { name: true, avatar: true }
                    }
                }
            }
        }
    });
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    return res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany();
    return res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});
export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, mrp, discount, stock, categoryId, images, sku } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    // Calculate selling price
    const sellingPrice = parseFloat(mrp) - (parseFloat(mrp) * (parseInt(discount) / 100));
    const product = await prisma.product.create({
        data: {
            name,
            slug,
            description,
            price: sellingPrice,
            comparePrice: parseFloat(mrp),
            discount: parseInt(discount),
            stock: parseInt(stock),
            categoryId,
            images,
            sku,
        }
    });
    return res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const category = await prisma.category.create({
        data: {
            name,
            slug,
            description,
            image
        }
    });
    return res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});
