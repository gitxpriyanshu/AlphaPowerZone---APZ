export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  CATEGORY: '/shop/:category',
  PRODUCT_DETAIL: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  WISHLIST: '/wishlist',
  FITNESS: '/fitness',
  TRACKER: '/tracker',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
  },
};

export const CATEGORIES = [
  { id: 'gym-equipment', name: 'Gym Equipment', image: '/images/cat_gym.jpg' },
  { id: 'apparel', name: 'Apparel', image: '/images/cat_apparel.jpg' },
  { id: 'footwear', name: 'Footwear', image: '/images/cat_footwear.jpg' },
  { id: 'supplements', name: 'Supplements', image: '/images/cat_supplements.jpg' },
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  PRODUCTS: '/products',
  ORDERS: '/orders',
  USER: '/users',
  AI: {
    RECOMMEND: '/ai/recommend',
  },
};
