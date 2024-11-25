export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  brand?: string;
  sku?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  discountPercentage?: number;
  tags?: string[];
  variants?: {
    color?: string;
    size?: string;
  }[];
}