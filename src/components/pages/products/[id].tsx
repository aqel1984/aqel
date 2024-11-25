'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  description: string
  price: number
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchProduct = useCallback(async (productId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      setProduct(data as Product)
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error fetching product. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id)
    }
  }, [params.id, fetchProduct])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!product) {
    return <div className="flex justify-center items-center h-screen">Product not found</div>
  }

  return (
    <>
      <Head>
        <title>{product.name} - Our Store</title>
        <meta name="description" content={product.description} />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Link href="/products">
          <Button variant="link">← Back to products</Button>
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{product.description}</p>
            <p className="text-2xl font-bold mb-4">Price: ${product.price.toFixed(2)}</p>
            <Button>Add to Cart</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}