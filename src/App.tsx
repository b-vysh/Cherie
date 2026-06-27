import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import AdminProducts from './pages/admin/AdminProducts';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#FFFAEB',
                color: '#115E63',
                border: '1px solid #115E63',
                borderRadius: '16px',
                fontWeight: 'bold',
              },
              success: {
                iconTheme: {
                  primary: '#115E63',
                  secondary: '#FFFAEB',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          <Analytics />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
