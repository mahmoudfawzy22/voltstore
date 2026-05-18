import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar           from './components/Navbar';
import ProtectedRoute   from './components/ProtectedRoute';
import ChatWidget       from './components/ChatWidget';
import Footer           from './components/Footer';

import ProductsPage     from './pages/ProductsPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import CartPage         from './pages/CartPage';
import OrdersPage       from './pages/OrdersPage';
import AdminPage        from './pages/AdminPage';
import AdminOrdersPage  from './pages/AdminOrdersPage';
import SupportPage      from './pages/SupportPage';

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/"              element={<ProductsPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />
              <Route path="/cart"          element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/orders"        element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/admin"         element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/orders"  element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
              <Route path="/support"       element={<ProtectedRoute adminOnly><SupportPage /></ProtectedRoute>} />
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 12 }}>404 — Page Not Found</h2>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
