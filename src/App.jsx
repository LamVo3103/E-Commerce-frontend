import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AuthPage from './pages/Auth/AuthPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SellerDashboard from './pages/Seller/SellerDashboard'; 
import HomePage from './pages/User/HomePage';
import ProductDetail from './pages/User/ProductDetail';
import CartPage from './pages/User/CartPage';
import UserProfile from './pages/User/UserProfile.jsx';
import { useAuth } from './contexts/AuthContext'; // Import context để lấy quyền
import './App.css';

// === COMPONENT CHỐT CHẶN BẢO VỆ ROUTE ===
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, userRole } = useAuth();

  // 1. Nếu chưa có token (chưa đăng nhập) -> Đá văng ra trang Login
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Nếu đã đăng nhập nhưng sai Role -> Đá về trang chủ
  // (Dùng includes để linh hoạt bắt các chuỗi như 'ROLE_ADMIN' hoặc 'ADMIN')
  if (allowedRoles && !allowedRoles.some(role => userRole?.includes(role))) {
    return <Navigate to="/" replace />;
  }

  // 3. Đúng người đúng tội -> Cho qua
  return children;
};

// === COMPONENT KHUNG GIAO DIỆN CỦA USER (Chứa Navbar/Footer) ===
const UserLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {/* <Outlet /> là nơi các trang con (Home, Detail, Cart...) sẽ hiện ra */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* ---------------------------------------------------
          NHÓM 1: CÁC TRANG CỦA KHÁCH HÀNG (Có Navbar & Footer)
          --------------------------------------------------- */}
      <Route element={<UserLayout />}>
        {/* Xem tự do không cần đăng nhập */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Bắt buộc phải đăng nhập mới cho xem Giỏ hàng & Profile */}
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['USER', 'ROLE_USER', 'ADMIN', 'SELLER']}>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['USER', 'ROLE_USER', 'ADMIN', 'SELLER']}>
            <UserProfile />
          </ProtectedRoute>
        } />
      </Route>

      {/* ---------------------------------------------------
          NHÓM 2: TRANG ĐĂNG NHẬP (Đứng độc lập, trống trơn)
          --------------------------------------------------- */}
      <Route path="/auth" element={<AuthPage />} />

      {/* ---------------------------------------------------
          NHÓM 3: ADMIN & SELLER (Bắt buộc đúng quyền, Không Navbar)
          --------------------------------------------------- */}
      <Route path="/seller/*" element={
        <ProtectedRoute allowedRoles={['SELLER', 'ROLE_SELLER']}>
          <SellerDashboard />
        </ProtectedRoute>
      } /> 
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } /> 

      {/* Trang lỗi 404 nếu gõ bậy URL */}
      <Route path="*" element={<div className="temp-view" style={{textAlign: 'center', marginTop: '100px'}}><h2>404 - Page Not Found</h2></div>} />
    </Routes>
  );
}

export default App;