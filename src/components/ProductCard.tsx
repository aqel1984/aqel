'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCartStore } from '@/lib/store'

interface Product {
  id: string
  name: string
  description?: string
  price_1kg: number
  imageUrl: string
  origin?: string
  grade?: string
  stock_quantity?: number
  harvested_date?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price_1kg,
      quantity: 1,
    })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>${product.price_1kg.toFixed(2)} per kg</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={product.imageUrl || '/placeholder.svg?height=200&width=200'}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=200"
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Origin: {product.origin || 'Unknown'}, Grade: {product.grade || 'Unspecified'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Stock: {product.stock_quantity !== undefined ? `${product.stock_quantity} kg` : 'Unknown'}
        </p>
        {product.harvested_date && (
          <p className="text-sm text-muted-foreground">
            Harvested: {new Date(product.harvested_date).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}