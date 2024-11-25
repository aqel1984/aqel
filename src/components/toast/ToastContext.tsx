"use client"

import React, { createContext, useCallback, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Toast, ToastContextType } from './types'

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uuidv4()
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }])
    setTimeout(() => removeToast(id), toast.duration || 3000)
  }, [removeToast])

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}