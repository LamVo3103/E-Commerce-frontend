import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
    const navigate = useNavigate();
    // Gộp chung 1 lần gọi useAuth
    const { login, token, userRole } = useAuth();
    
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phone: '',
        address: ''
    });

    // BẢO VỆ TRANG: Tự động chuyển hướng nếu đã đăng nhập
    useEffect(() => {
        if (token && userRole) {
            if (userRole === 'ADMIN') navigate('/admin');
            else if (userRole === 'SELLER') navigate('/seller');
            else navigate('/');
        }
    }, [token, userRole, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            if (isLoginMode) {
                const accessToken = await loginUser({
                    username: formData.username,
                    password: formData.password
                });
                
                // 1. Lưu token vào Context toàn cục
                login(accessToken);
                
                // 2. Giải mã để xem tài khoản này là Admin, Seller hay User
                const decoded = jwtDecode(accessToken);
                setSuccessMessage(`Login successful! Redirecting to ${decoded.role} dashboard...`);
                
                // 3. Chuyển hướng thông minh
                setTimeout(() => {
                    if (decoded.role === 'ADMIN') {
                        navigate('/admin');
                    } else if (decoded.role === 'SELLER') {
                        navigate('/seller');
                    } else {
                        navigate('/');
                    }
                }, 1500);

            } else {
                const response = await registerUser(formData);
                setSuccessMessage(response || 'Registration successful! Please login.');
                setTimeout(() => setIsLoginMode(true), 2000);
            }
        } catch (error) {
            setErrorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants cho Framer Motion
    const formVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLoginMode ? 'Enter your details to access your account.' : 'Join us to start shopping.'}</p>
                </div>

                {errorMessage && <div className="message error-message">{errorMessage}</div>}
                {successMessage && <div className="message success-message">{successMessage}</div>}

                <AnimatePresence mode="wait">
                    <motion.form 
                        key={isLoginMode ? "login" : "register"}
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >
                        <div className="input-group">
                            <User className="input-icon" size={20} />
                            <input 
                                type="text" 
                                name="username" 
                                placeholder="Username" 
                                value={formData.username} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>

                        {!isLoginMode && (
                            <>
                                <div className="input-group">
                                    <Mail className="input-icon" size={20} />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="Email Address" 
                                        value={formData.email} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                                <div className="input-group">
                                    <Phone className="input-icon" size={20} />
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        placeholder="Phone Number" 
                                        value={formData.phone} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                                <div className="input-group">
                                    <MapPin className="input-icon" size={20} />
                                    <input 
                                        type="text" 
                                        name="address" 
                                        placeholder="Address" 
                                        value={formData.address} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <Lock className="input-icon" size={20} />
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Password" 
                                value={formData.password} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>

                        <motion.button 
                            type="submit" 
                            className="submit-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
                            {!isLoading && <ArrowRight size={20} />}
                        </motion.button>
                    </motion.form>
                </AnimatePresence>

                <div className="auth-footer">
                    <p>
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <span className="toggle-link" onClick={toggleMode}>
                            {isLoginMode ? 'Sign up here' : 'Login here'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;