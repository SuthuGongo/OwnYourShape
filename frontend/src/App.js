import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import Home        from './pages/Home';
import Gymwear     from './pages/Gymwear';
import Swimwear      from './pages/Swimwear';
import ProductDetail from './pages/ProductDetail';
import Cart        from './pages/Cart';
import Checkout    from './pages/Checkout';
import OrderConfirm from './pages/OrderConfirm';
import Account     from './pages/Account';
import Profile     from './pages/Profile';
import Contact     from './pages/Contact';
import NotFound    from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/"                      element={<Home />} />
            <Route path="/gymwear"              element={<Gymwear />} />
            <Route path="/swimwear"              element={<Swimwear />} />
            <Route path="/products/:slug"        element={<ProductDetail />} />
            <Route path="/cart"                  element={<Cart />} />
            <Route path="/checkout"              element={<Checkout />} />
            <Route path="/order/:orderNumber"    element={<OrderConfirm />} />
            <Route path="/account"               element={<Account />} />
            <Route path="/profile"               element={<Profile />} />
            <Route path="/contact"               element={<Contact />} />
            <Route path="*"                      element={<NotFound />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
