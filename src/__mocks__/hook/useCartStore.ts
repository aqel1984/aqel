import { useState, useEffect } from 'react'
import { create } from 'zustand'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getTotal: () => number
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(item => item.id === newItem.id)
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
    }
    return { items: [...state.items, newItem] }
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
  }
}))

export function useCart() {
  const store = useCartStore()
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true on the client-side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cart from localStorage on client-side
  useEffect(() => {
    if (isClient) {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        useCartStore.setState({ items: JSON.parse(savedCart) })
      }
    }
  }, [isClient])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(store.items))
    }
  }, [isClient, store.items])

  return store
}