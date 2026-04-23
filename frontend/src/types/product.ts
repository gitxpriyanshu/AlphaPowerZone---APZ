export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  discount?: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  stock: number;
  avgRating: number;
  reviewCount: number;
  tags: string[];
  isFeatured?: boolean;
  sizes?: string[];
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type Category = 'gym-equipment' | 'apparel' | 'footwear' | 'supplements';
