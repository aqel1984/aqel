import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id)
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }
    }
    return { items: [...state.items, { ...item, quantity: 1 }] }
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  updateItemQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter((item) => item.quantity > 0),
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}))