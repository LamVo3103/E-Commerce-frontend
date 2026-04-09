import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Filter, Search } from 'lucide-react';
import { getAllActiveProducts } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { addToCart } = useCart();
    
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // STATES CHO BỘ LỌC VÀ TÌM KIẾM
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllActiveProducts(token, 0, 50);
                const actualProducts = Array.isArray(data) ? data : (data.content || []);
                setProducts(actualProducts);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [token]);

    const categories = useMemo(() => {
        const cats = new Set();
        products.forEach(p => {
            if (p.categories && p.categories.length > 0) cats.add(p.categories[0].name);
        });
        return ['All', ...Array.from(cats)];
    }, [products]);

    // LOGIC LỌC KÉP: VỪA THEO CATEGORY, VỪA THEO TỪ KHÓA TÌM KIẾM
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCategory = selectedCategory === 'All' || (p.categories && p.categories.length > 0 && p.categories[0].name === selectedCategory);
            const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [products, selectedCategory, searchTerm]);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="home-container">
            {/* HERO BANNER MỚI CỰC XỊN */}
            <div className="home-banner">
                <div className="banner-content">
                    <motion.h1 initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}}>
                        Khám Phá Thế Giới Mua Sắm Của Bạn
                    </motion.h1>
                    <motion.p initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}}>
                        Hàng ngàn sản phẩm công nghệ & thể thao chất lượng cao đang chờ đón bạn.
                    </motion.p>

                    {/* THANH TÌM KIẾM CHUYỂN XUỐNG ĐÂY */}
                    <motion.div className="hero-search-bar" initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{delay: 0.3}}>
                        <Search className="search-icon-hero" size={24} />
                        <input 
                            type="text" 
                            placeholder="Bạn đang tìm gì hôm nay?" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn">Tìm kiếm</button>
                    </motion.div>

                    <motion.div className="banner-tags" initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.4}}>
                        <span>Giá tốt mỗi ngày</span>
                        <span className="dot">•</span>
                        <span>Giao hàng siêu tốc</span>
                        <span className="dot">•</span>
                        <span>100% Chính hãng</span>
                    </motion.div>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-spinner">Loading amazing products...</div>
            ) : (
                <>
                    <div className="category-filter-section">
                        <div className="filter-title">
                            <Filter size={20} /> <span>Lọc theo danh mục:</span>
                        </div>
                        <div className="filter-buttons">
                            {categories.map((cat) => (
                                <button 
                                    key={cat} 
                                    className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat === 'All' ? 'Tất cả' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div className="product-grid" variants={containerVariants} initial="hidden" animate="show">
                        {filteredProducts.length === 0 ? (
                            <div className="no-products-found">
                                <h3>Không tìm thấy sản phẩm nào!</h3>
                                <p>Thử tìm với từ khóa khác hoặc chọn danh mục "Tất cả" nhé.</p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <motion.div key={product.id} className="product-card" variants={itemVariants} onClick={() => navigate(`/product/${product.id}`, { state: { product } })}>
                                    <div className="card-image-wrap">
                                        <img src={product.img && product.img.length > 0 ? product.img[0] : 'https://via.placeholder.com/300'} alt={product.name} />
                                    </div>
                                    <div className="card-content">
                                        <p className="card-category">
                                            {product.categories && product.categories.length > 0 ? product.categories[0].name : 'General'}
                                        </p>
                                        <h3 className="card-title">{product.name}</h3>
                                        <div className="card-bottom">
                                            <span className="card-price">{product.sellPrice.toLocaleString()} đ</span>
                                            <button 
                                                className="add-cart-btn" 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    addToCart(product, 1); 
                                                    alert(`Đã thêm ${product.name} vào giỏ!`); 
                                                }}
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default HomePage;