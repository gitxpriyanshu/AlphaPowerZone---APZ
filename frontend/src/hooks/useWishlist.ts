import { useWishlistStore } from '@store/wishlistStore';

/**
 * Custom hook for wishlist operations
 */
export const useWishlist = () => {
  const { items, addItem, removeItem, isInWishlist } = useWishlistStore();

  return {
    items,
    addItem,
    removeItem,
    isInWishlist,
  };
};
