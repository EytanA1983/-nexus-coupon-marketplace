import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import CouponList from './pages/admin/CouponList';
import CouponForm from './pages/admin/CouponForm';
import CouponDetail from './pages/admin/CouponDetail';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customer/products" replace />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/coupons" element={<CouponList />} />
        <Route path="/admin/coupons/new" element={<CouponForm />} />
        <Route path="/admin/coupons/:id" element={<CouponDetail />} />
        <Route path="/admin/coupons/:id/edit" element={<CouponForm />} />
        
        {/* Customer */}
        <Route path="/customer/products" element={<ProductList />} />
        <Route path="/customer/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

