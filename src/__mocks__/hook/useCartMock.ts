'use client'

import { useState, useCallback } from 'react'

type Product = {
  id: string
  name: string
  price: number
}

type CartItem = {
  product: Product
  quantity: number
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Add an item to the cart
  const addToCart = useCallback((product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { product, quantity }]
    })
  }, [])

  // Remove an item from the cart
  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId))
  }, [])

  // Clear the entire cart
  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  // Calculate the total number of items in the cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
  }
}