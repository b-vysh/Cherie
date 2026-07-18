import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  variant?: string | null;
  customMessage?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: string | null, customMessage?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateCustomMessage: (cartItemId: string, customMessage: string) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cherie_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cherie_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, variant: string | null = null, customMessage: string = '') => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.variant === variant && 
        item.customMessage === customMessage
      );
      
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.cartItemId === existing.cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock <= 0) return prev;
      
      const cartItemId = `${product.id}-${Date.now()}`;
      return [...prev, { ...product, cartItemId, quantity: 1, variant, customMessage }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ));
  };

  const updateCustomMessage = (cartItemId: string, customMessage: string) => {
    setCart(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, customMessage } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateCustomMessage, clearCart, totalItems, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
