'use client'

import { useState, useCallback, useMemo } from 'react'

export interface Product {
  id: string
  name: string
  price: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

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

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(0, newQuantity) } 
          : item
      ).filter(item => item.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const totalItems = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const totalPrice = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  )

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }
}