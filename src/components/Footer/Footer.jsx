import React from 'react';
import { Globe, MessageCircle, Share2, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3 className="footer-logo">E-Commerce</h3>
                    <p className="brand-desc">Hãy mua những gì bạn thích</p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><Globe size={20} /></a>
                        <a href="#" className="social-icon"><MessageCircle size={20} /></a>
                        <a href="#" className="social-icon"><Share2 size={20} /></a>
                    </div>
                </div>

                <div className="footer-links-group">
                    <h4 className="group-title">Các liên kết</h4>
                    <ul className="link-list">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Shop</a></li>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>

                <div className="footer-links-group">
                    <h4 className="group-title">Dịch vụ khách hàng</h4>
                    <ul className="link-list">
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Chính sách vận chuyển</a></li>
                        <li><a href="#">Trả hàng & Hoàn tiền</a></li>
                        <li><a href="#">Điều khoản & Điều kiện</a></li>
                    </ul>
                </div>

                <div className="footer-newsletter">
                    <h4 className="group-title">Nhận tin mới</h4>
                    <p>Đăng ký nhận bản tin của chúng tôi để nhận các ưu đãi mới nhất.</p>
                    <div className="newsletter-input-wrap">
                        <input type="email" placeholder="Nhập email của bạn" className="newsletter-input" />
                        <button className="newsletter-btn"><Mail size={18} /></button>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {currentYear} E-Commerce</p>
            </div>
        </footer>
    );
};

export default Footer;