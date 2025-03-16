"use client";

import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast';

type ToastType = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastProvider>
        {children}
        <ToastViewport />
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            variant={toast.variant}
            onOpenChange={() => removeToast(toast.id)}
          >
            <div className="grid gap-1">
              {toast.title && <div className="font-medium">{toast.title}</div>}
              {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
            </div>
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastContainer');
  }
  return context;
} 