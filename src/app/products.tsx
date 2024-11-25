'use client';

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchProducts } from '@/lib/api'
import type { Product } from '@/lib/api'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Our Products</h1>
        <p className="text-gray-600 mt-2">Browse our selection of premium coffee beans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>
                Origin: {product.origin} | Grade: {product.grade}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Image 
                src={`/products/${product.id}.jpg`} 
                alt={product.name} 
                width={200} 
                height={200}
                className="rounded-lg object-cover w-full"
              />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>1kg Price:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(product.price_1kg)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>100kg Price:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(product.price_100kg)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>20ft Container:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(product.price_20ft)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>40ft Container:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(product.price_40ft)}
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Stock: {product.stock_quantity}kg</p>
                  <p>Harvested: {new Date(product.harvested_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Request Quote</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}