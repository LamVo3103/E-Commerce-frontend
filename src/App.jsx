import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AuthPage from './pages/Auth/AuthPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SellerDashboard from './pages/Seller/SellerDashboard'; 
import HomePage from './pages/User/HomePage';
import ProductDetail from './pages/User/ProductDetail';
import CartPage from './pages/User/CartPage';
import UserProfile from './pages/User/UserProfile.jsx';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/seller/*" element={<SellerDashboard />} /> 
          <Route path="/admin/*" element={<AdminDashboard />} /> 
          <Route path="/profile" element={<UserProfile />} />
          
          <Route path="*" element={<div className="temp-view">404 - Page Not Found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;