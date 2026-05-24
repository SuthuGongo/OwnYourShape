import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'dil_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, colour = '', quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === product.id && i.size === size && i.colour === colour
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prev, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: parseFloat(product.price),
        image: product.main_image_url || null,
        size,
        colour,
        quantity,
      }];
    });
  };

  const removeFromCart = (id, size, colour) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === id && i.size === size && i.colour === colour))
    );
  };

  const updateQuantity = (id, size, colour, quantity) => {
    if (quantity < 1) { removeFromCart(id, size, colour); return; }
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size && i.colour === colour ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const deliveryFee = subtotal >= 850 ? 0 : 95;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      subtotal, total, deliveryFee, totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
