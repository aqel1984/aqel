import { create } from 'zustand';
import type { ToastMessage } from '@/hooks/useToast';

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: ToastMessage) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
