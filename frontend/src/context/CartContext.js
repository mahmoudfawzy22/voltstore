import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]       = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from backend when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await cartService.get();
      setCart(data.cart || []);
    } catch {
      setCart([]);
    }
  };

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      await cartService.add(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Could not add to cart.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setLoading(true);
    try {
      await cartService.update(productId, quantity);
      await fetchCart();
    } catch (err) {
      console.error('Update qty error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setLoading(true);
    try {
      await cartService.remove(productId);
      await fetchCart();
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clear();
      setCart([]);
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, loading, totalItems, totalPrice,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
