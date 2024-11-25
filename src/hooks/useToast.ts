import { useCallback } from 'react';
import { useToastStore } from '@/store/toast';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  variant: ToastVariant;
}

export function useToast() {
  const { toasts, addToast: addToastToStore, removeToast } = useToastStore();

  const addToast = useCallback((options: ToastOptions) => {
    const id = Date.now().toString();
    const toast: ToastMessage = {
      id,
      title: options.title,
      description: options.description || '',
      variant: options.variant || 'default',
    };
    addToastToStore(toast);
    return toast;
  }, [addToastToStore]);

  return {
    toasts,
    addToast,
    removeToast,
  };
}