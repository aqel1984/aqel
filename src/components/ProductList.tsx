'use client';

import React from 'react';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price_1kg: number;
  imageUrl: string;
  origin?: string;
  grade?: string;
  stock_quantity?: number;
  harvested_date?: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Raw Shea Butter',
    description: 'Premium quality, unrefined shea butter sourced directly from West Africa.',
    price_1kg: 10,
    imageUrl: '/placeholder.svg?height=200&width=200',
    origin: 'West Africa',
    grade: 'A',
    stock_quantity: 500,
    harvested_date: '2023-01-15',
  },
  {
    id: '2',
    name: 'Raw Cocoa Butter',
    description: 'High-quality, unrefined cocoa butter from premium cocoa beans.',
    price_1kg: 12,
    imageUrl: '/placeholder.svg?height=200&width=200',
    origin: 'Ghana',
    grade: 'Premium',
    stock_quantity: 300,
    harvested_date: '2023-02-01',
  },
  // Add more products as needed
];

const ProductList: React.FC = () => {
  return (
    <section aria-labelledby="product-heading">
      <h2 id="product-heading" className="text-3xl font-bold mb-6">Our Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductList;