import { useCartStore } from '@store/cartStore';

/**
 * Custom hook for cart operations
 */
export const useCart = () => {
  const {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    getTotal,
    getItemCount
  } = useCartStore();

  return {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    total: getTotal(),
    itemCount: getItemCount(),
  };
};
