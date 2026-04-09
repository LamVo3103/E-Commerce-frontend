import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, UserCircle, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getProductComments, writeComment } from '../../services/commentService';
import { getCurrentUser } from '../../services/userService'; 
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token, userRole } = useAuth();
    const { addToCart } = useCart();
    
    const product = location.state?.product;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5); 
    const [hoverRating, setHoverRating] = useState(0); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // === THÊM STATE CHO SỐ LƯỢNG MUA ===
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!product) {
            navigate('/'); 
            return;
        }
        fetchComments();
    }, [product]);

    const fetchComments = async () => {
        if (!token) return; 
        try {
            const data = await getProductComments(token, product.id);
            setComments(data || []);
        } catch (error) {
            console.error("Lỗi tải bình luận:", error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token || userRole !== 'USER') {
            alert('Vui lòng đăng nhập với tư cách Khách hàng để đánh giá!');
            navigate('/auth');
            return;
        }
        if (!newComment.trim()) {
            alert('Vui lòng nhập nội dung đánh giá!');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await getCurrentUser(token);
            await writeComment(token, user.id, {
                productId: product.id,
                content: newComment,
                rating: rating
            });
            
            alert('Cảm ơn bạn đã đánh giá!');
            setNewComment('');
            setRating(5);
            fetchComments(); 
        } catch (error) {
            alert(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // === HÀM XỬ LÝ TĂNG GIẢM SỐ LƯỢNG ===
    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrease = () => {
        if (quantity < product.stock) setQuantity(quantity + 1);
    };

    // === TÍNH TOÁN SỐ SAO TRUNG BÌNH ===
    const averageRating = comments.length > 0 
        ? (comments.reduce((sum, cmt) => sum + (cmt.rating || 5), 0) / comments.length).toFixed(1)
        : 0;

    if (!product) return null;

    return (
        <div className="product-detail-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} /> Quay lại
            </button>

            <div className="product-main-info">
                <div className="product-image-gallery">
                    <img src={product.img && product.img.length > 0 ? product.img[0] : 'https://via.placeholder.com/400'} alt={product.name} />
                </div>
                <div className="product-details">
                    <h1>{product.name}</h1>
                    
                    {/* === HIỂN THỊ SỐ SAO TRUNG BÌNH === */}
                    <div className="product-rating-summary">
                        {comments.length > 0 ? (
                            <>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={18} className={star <= Math.round(averageRating) ? 'filled' : 'empty'} />
                                    ))}
                                </div>
                                <span>{averageRating} / 5 ({comments.length} đánh giá)</span>
                            </>
                        ) : (
                            <span className="no-rating-text">Chưa có đánh giá</span>
                        )}
                    </div>

                    <div className="product-meta">
                        <span className="category-tag">
                            {product.categories && product.categories.length > 0 ? product.categories[0].name : 'General'}
                        </span>
                        <span className="stock-info">Kho: {product.stock} sản phẩm</span>
                    </div>
                    <div className="product-price">{product.sellPrice.toLocaleString()} đ</div>
                    
                    {/* === KHU VỰC CHỌN SỐ LƯỢNG === */}
                    <div className="quantity-section">
                        <span className="qty-label">Số lượng:</span>
                        <div className="qty-controls">
                            <button onClick={handleDecrease} disabled={quantity <= 1}><Minus size={16}/></button>
                            <input type="number" value={quantity} readOnly />
                            <button onClick={handleIncrease} disabled={quantity >= product.stock}><Plus size={16}/></button>
                        </div>
                    </div>

                    <button 
                        className="add-to-cart-large"
                        // Cập nhật hàm gọi giỏ hàng với đúng số lượng đã chọn
                        onClick={() => { addToCart(product, quantity); alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`); }}
                        disabled={product.stock <= 0}
                    >
                        <ShoppingCart size={22} /> {product.stock > 0 ? 'THÊM VÀO GIỎ HÀNG' : 'HẾT HÀNG'}
                    </button>
                </div>
            </div>

            {/* KHU VỰC ĐÁNH GIÁ KẾ TẾP BÊN DƯỚI (Giữ nguyên) */}
            <div className="review-section">
                <h2>Đánh giá sản phẩm</h2>

                {userRole === 'USER' ? (
                    <form className="review-form" onSubmit={handleSubmitReview}>
                        <h4>Gửi đánh giá của bạn</h4>
                        <div className="star-rating-input">
                            <span>Chất lượng sản phẩm:</span>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        size={28}
                                        className={`star-icon ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                            <span className="rating-text">{rating} / 5 Sao</span>
                        </div>
                        <textarea 
                            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows="4"
                        ></textarea>
                        <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                        </button>
                    </form>
                ) : (
                    <div className="login-prompt">
                        <p>Bạn phải đăng nhập với tài khoản Khách hàng để gửi đánh giá.</p>
                    </div>
                )}

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="no-comments">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    ) : (
                        comments.map((cmt, index) => (
                            <div key={cmt.id || index} className="comment-item">
                                <div className="comment-avatar">
                                    <UserCircle size={40} color="#94a3b8" />
                                </div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{cmt.username || 'Khách hàng'}</span>
                                        <div className="comment-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < (cmt.rating || 5) ? 'filled' : 'empty'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="comment-text">{cmt.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;