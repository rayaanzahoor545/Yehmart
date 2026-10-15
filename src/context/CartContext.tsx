import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem } from '../types';
import { storeService } from '../services/storeService';
import { SITE_CONFIG } from '../config/site';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingProgress: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => storeService.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    storeService.saveCart(cart);
  }, [cart]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1): boolean => {
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock <= 0) return false;

    const price = variant?.priceOverride ?? product.price;
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.variantId === variant?.id
    );

    let updatedCart = [...cart];
    if (existingIndex > -1) {
      const newQty = updatedCart[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        updatedCart[existingIndex].quantity = availableStock;
      } else {
        updatedCart[existingIndex].quantity = newQty;
      }
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${variant?.id || 'base'}-${Date.now()}`,
        productId: product.id,
        variantId: variant?.id,
        product,
        selectedVariant: variant,
        quantity: Math.min(quantity, availableStock),
        unitPrice: price,
      };
      updatedCart = [newItem, ...updatedCart];
    }

    setCart(updatedCart);
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const maxStock = item.selectedVariant ? item.selectedVariant.stock : item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = SITE_CONFIG.freeShippingThreshold;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        freeShippingProgress,
        amountNeededForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
