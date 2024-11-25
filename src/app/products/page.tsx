'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import AppleBusinessChat from '@/components/AppleBusinessChat';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  sizes: {
    size: string;
    price: number;
    unit: string;
  }[];
  image: string;
  origin: string;
  certifications: string[];
}

const products: Product[] = [
  {
    id: 'raw-shea',
    name: 'Raw Shea Butter',
    description: 'Premium unrefined shea butter sourced directly from Ghana. Our shea butter is hand-crafted by local artisans using traditional methods, ensuring the highest quality and purity.',
    benefits: [
      'Rich in vitamins A, E, and F',
      'Natural moisturizer for skin and hair',
      'Anti-inflammatory properties',
      'Helps reduce stretch marks',
      'Promotes skin elasticity',
    ],
    sizes: [
      { size: '1', price: 20, unit: 'kg' },
      { size: '10', price: 200, unit: 'kg' },
      { size: '1', price: 2000, unit: 'tonne' },
      { size: '20ft', price: 100000, unit: 'container' },
      { size: '40ft', price: 200000, unit: 'container' },
    ],
    image: '/images/raw-shea.jpg',
    origin: 'Ghana',
    certifications: ['Organic', 'Fair Trade', 'USDA Certified'],
  },
  {
    id: 'cocoa-butter',
    name: 'Cocoa Butter',
    description: 'Pure, food-grade cocoa butter perfect for both cosmetic and culinary applications. Sourced from premium cocoa beans from West Africa.',
    benefits: [
      'Rich in antioxidants',
      'Natural chocolate aroma',
      'Improves skin elasticity',
      'Perfect for DIY cosmetics',
      'Ideal for chocolate making',
    ],
    sizes: [
      { size: '1', price: 25, unit: 'kg' },
      { size: '10', price: 240, unit: 'kg' },
      { size: '1', price: 2300, unit: 'tonne' },
      { size: '20ft', price: 110000, unit: 'container' },
      { size: '40ft', price: 210000, unit: 'container' },
    ],
    image: '/images/cocoa-butter.jpg',
    origin: 'Côte d\'Ivoire',
    certifications: ['Food Grade', 'USDA Certified', 'Fair Trade'],
  },
];

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-primary-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-800 mb-6">
            Our Premium Products
          </h1>
          <p className="text-xl text-primary-600 max-w-2xl">
            Discover our range of premium West African butters, sourced directly from local communities
            and processed using traditional methods to preserve their natural benefits.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="relative h-80">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-800 mb-2">{product.name}</h2>
                      <p className="text-sm text-natural-600">Origin: {product.origin}</p>
                    </div>
                    <div className="flex gap-2">
                      {product.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="px-2 py-1 bg-accent-100 text-accent-800 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-natural-700 mb-6">{product.description}</p>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Key Benefits:</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {product.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center text-sm text-natural-600">
                          <span className="w-2 h-2 bg-accent-400 rounded-full mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Available Sizes:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {product.sizes.map(({ size, price, unit }) => (
                        <button
                          key={`${size}${unit}`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedSize(`${size}${unit}`);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            selectedProduct?.id === product.id && selectedSize === `${size}${unit}`
                              ? 'bg-primary text-white'
                              : 'bg-natural-50 text-natural-800 hover:bg-natural-100'
                          }`}
                        >
                          {size} {unit}
                          <span className="block text-xs">
                            ${price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        // Handle order
                      }}
                    >
                      Order Now
                    </Button>
                    <AppleBusinessChat
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Orders CTA */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Looking for Bulk Orders?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We offer competitive prices for bulk orders and can customize packaging to meet your needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Request Quote
            </Button>
            <AppleBusinessChat
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            />
          </div>
        </div>
      </section>

      {/* Quality Guarantee */}
      <section className="py-16 bg-natural-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-6">Our Quality Guarantee</h2>
              <p className="text-natural-700 mb-6">
                Every product we offer undergoes rigorous quality testing to ensure it meets our high
                standards. We work directly with local communities in West Africa to maintain
                sustainable and ethical sourcing practices.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-natural-700">
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-2" />
                  100% pure and natural
                </li>
                <li className="flex items-center text-natural-700">
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-2" />
                  Ethically sourced
                </li>
                <li className="flex items-center text-natural-700">
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-2" />
                  Fair trade certified
                </li>
                <li className="flex items-center text-natural-700">
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-2" />
                  Laboratory tested
                </li>
              </ul>
            </div>
            <div className="relative h-96">
              <Image
                src="/images/quality.jpg"
                alt="Quality Testing"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}