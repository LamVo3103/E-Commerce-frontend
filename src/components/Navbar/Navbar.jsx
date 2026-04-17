import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext'; 
import { jwtDecode } from 'jwt-decode'; // === THÊM DÒNG NÀY VÀO ===
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { token, userRole, logout } = useAuth();
    const { getCartCount } = useCart(); 
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    let homeLink = '/';
    if (userRole === 'ADMIN') homeLink = '/admin';
    else if (userRole === 'SELLER') homeLink = '/seller';

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const showCart = userRole !== 'ADMIN' && userRole !== 'SELLER';

    // === GIẢI MÃ TOKEN ĐỂ LẤY TÊN USER ===
    let username = '';
    if (token) {
        try {
            const decoded = jwtDecode(token);
            username = decoded.sub; // Backend lưu tên vào trường 'sub' (Subject)
        } catch (error) {
            console.error("Lỗi giải mã token");
        }
    }

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <Link to={homeLink} className="navbar-logo">
                    <span className="logo-highlight">E</span>-Commerce
                </Link>

                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    {userRole === 'SELLER' || userRole === 'ADMIN' ? (
                        <Link to={homeLink} className="nav-item">Store Management</Link>
                    ) : (
                        <>
                            <Link to="/" className="nav-item">Home</Link>
                            {token && userRole === 'USER' && (
                                <Link to="/profile" className="nav-item">Theo dõi đơn hàng</Link>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-actions">
                    {showCart && (
                        <Link to="/cart" className="action-btn cart-btn">
                            <ShoppingCart size={22} />
                            {getCartCount() > 0 && (
                                <span className="cart-badge">{getCartCount()}</span>
                            )}
                        </Link>
                    )}
                    
                    {/* === CHỖ NÀY: HIỂN THỊ ICON KÈM TÊN USER === */}
                    <Link to={token ? (userRole === 'USER' ? '/profile' : homeLink) : "/auth"} className="action-btn profile-wrapper" title="Profile">
                        <User size={22} />
                        {username ? (
                            <span className="nav-username">Hi, {username}</span>
                        ) : (
                            <span className="nav-username">Login</span>
                        )}
                    </Link>

                    {token && (
                        <button onClick={handleLogout} className="action-btn logout-btn-nav" title="Đăng xuất">
                            <LogOut size={22} color="#ef4444" />
                        </button>
                    )}

                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;