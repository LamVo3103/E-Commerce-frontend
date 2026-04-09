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
                    <p className="brand-desc">Your ultimate shopping destination. Quality products, fast delivery, and excellent customer service.</p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><Globe size={20} /></a>
                        <a href="#" className="social-icon"><MessageCircle size={20} /></a>
                        <a href="#" className="social-icon"><Share2 size={20} /></a>
                    </div>
                </div>

                <div className="footer-links-group">
                    <h4 className="group-title">Quick Links</h4>
                    <ul className="link-list">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Shop</a></li>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>

                <div className="footer-links-group">
                    <h4 className="group-title">Customer Service</h4>
                    <ul className="link-list">
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Shipping Policy</a></li>
                        <li><a href="#">Returns & Refunds</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                    </ul>
                </div>

                <div className="footer-newsletter">
                    <h4 className="group-title">Stay Updated</h4>
                    <p>Subscribe to our newsletter for the latest deals.</p>
                    <div className="newsletter-input-wrap">
                        <input type="email" placeholder="Enter your email" className="newsletter-input" />
                        <button className="newsletter-btn"><Mail size={18} /></button>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {currentYear} E-Commerce Platform. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;