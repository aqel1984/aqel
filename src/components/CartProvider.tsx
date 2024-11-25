'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id)
      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items]
        if (updatedItems[existingItemIndex]) {
          updatedItems[existingItemIndex].quantity += action.payload.quantity
        }
        return { ...state, items: updatedItems }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  const { state, dispatch } = context

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }, [dispatch])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [dispatch])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [dispatch])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [dispatch])

  const getItemCount = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }, [state.items])

  return {
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
  }
}