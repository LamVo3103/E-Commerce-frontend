import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Wallet, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../services/userService';
import { createOrder, createMomoPayment } from '../../services/orderService';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { cartItems, updateQuantity, removeItem, clearCart, getCartTotal } = useCart();
    
    const [paymentMethod, setPaymentMethod] = useState('DIRECT'); // DIRECT: Tiền mặt, TRANFER: Momo
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = async () => {
        if (!token) {
            alert("Vui lòng đăng nhập để thanh toán!");
            navigate('/auth');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Lấy ID user hiện tại
            const user = await getCurrentUser(token);

            // 2. Chuyển đổi giỏ hàng sang định dạng Backend yêu cầu (OrderReqDTO)
            const orderReqDTO = {
                paymentMethod: paymentMethod, // 'DIRECT' hoặc 'TRANFER'
                item: cartItems.map(cartItem => ({
                    productId: cartItem.product.id,
                    quantity: cartItem.quantity,
                    orderId: 0 // Tham số bắt buộc của BE nhưng BE không dùng lúc Create
                }))
            };

            // 3. Gọi API Tạo đơn hàng
            const newOrder = await createOrder(token, user.id, orderReqDTO);

            // 4. Xử lý luồng thanh toán
            if (paymentMethod === 'DIRECT') {
                alert('Đặt hàng thành công! Vui lòng chuẩn bị tiền mặt khi nhận hàng.');
                clearCart();
                navigate('/'); // Trở về trang chủ
            } else if (paymentMethod === 'TRANFER') {
                // Gọi API Momo lấy link
                alert('Đang chuyển hướng sang cổng thanh toán Momo...');
                const payUrl = await createMomoPayment(token, newOrder.id);
                clearCart(); // Xóa giỏ
                window.location.href = payUrl; // Đá trình duyệt sang trang của Momo
            }

        } catch (error) {
            alert(error);
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="empty-cart-container">
                <ShoppingBag size={80} color="#cbd5e1" />
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Hãy tìm thêm những sản phẩm tuyệt vời nhé!</p>
                <button className="primary-btn" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <h1 className="cart-page-title">Shopping Cart</h1>
            
            <div className="cart-layout">
                {/* Cột trái: Danh sách sản phẩm */}
                <div className="cart-items-section">
                    {cartItems.map((item) => (
                        <motion.div className="cart-item-card" key={item.product.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                            <img 
                                src={item.product.img && item.product.img.length > 0 ? item.product.img[0] : 'https://via.placeholder.com/100'} 
                                alt={item.product.name} 
                                className="cart-item-img" 
                            />
                            <div className="cart-item-info">
                                <h3>{item.product.name}</h3>
                                <p className="item-price">{item.product.sellPrice.toLocaleString()} đ</p>
                            </div>
                            
                            <div className="cart-item-actions">
                                <div className="qty-control">
                                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                                    <input type="text" value={item.quantity} readOnly />
                                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                                </div>
                                <button className="remove-btn" onClick={() => removeItem(item.product.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Cột phải: Tổng tiền và Thanh toán */}
                <div className="cart-summary-section">
                    <h2>Order Summary</h2>
                    
                    <div className="summary-row">
                        <span>Tạm tính:</span>
                        <span>{getCartTotal().toLocaleString()} đ</span>
                    </div>
                    <div className="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span>Miễn phí</span>
                    </div>
                    <div className="summary-row total-row">
                        <span>Tổng cộng:</span>
                        <span className="total-price">{getCartTotal().toLocaleString()} đ</span>
                    </div>

                    {/* Lựa chọn phương thức thanh toán */}
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 'DIRECT' ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="DIRECT" 
                                checked={paymentMethod === 'DIRECT'} 
                                onChange={() => setPaymentMethod('DIRECT')} 
                            />
                            <Wallet size={20} /> Thanh toán khi nhận hàng (COD)
                        </label>
                        <label className={`payment-option ${paymentMethod === 'TRANFER' ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="TRANFER" 
                                checked={paymentMethod === 'TRANFER'} 
                                onChange={() => setPaymentMethod('TRANFER')} 
                            />
                            <CreditCard size={20} /> Thanh toán qua Ví MoMo
                        </label>
                    </div>

                    <button 
                        className="checkout-btn" 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Đang xử lý...' : `Thanh toán ${getCartTotal().toLocaleString()} đ`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;