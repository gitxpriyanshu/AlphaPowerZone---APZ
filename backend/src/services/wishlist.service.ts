import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async (userId: string) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items,
      count: items.length,
    };
  },

  /**
   * Toggle product in wishlist
   */
  toggleWishlist: async (userId: string, productId: string) => {
    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, 'Product not found');

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return { added: false };
    } else {
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
      return { added: true };
    }
  },

  /**
   * Remove specific item
   */
  removeItem: async (userId: string, productId: string) => {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async (userId: string) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId },
    });
  },
};
