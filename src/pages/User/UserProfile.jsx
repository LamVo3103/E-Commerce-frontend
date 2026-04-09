import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Package, ShoppingCart, LogOut, Clock, CheckCircle, XCircle, Truck, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/userService';
import { getUserOrders } from '../../services/orderService';
import './UserProfile.css';

const UserProfile = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); // Mở sẵn tab Lịch sử mua hàng luôn cho nhanh
    
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!token) {
                navigate('/auth');
                return;
            }
            try {
                // 1. Lấy thông tin user
                const user = await getCurrentUser(token);
                setUserInfo(user);

                // 2. Lấy danh sách đơn hàng
                const orderData = await getUserOrders(token, user.id);
                
                // === ĐÂY LÀ ĐOẠN RADAR MÌNH VỪA GẮN THÊM VÀO ===
                console.log("1. DỮ LIỆU TỪ BACKEND GỬI VỀ:", orderData);

                let actualOrders = [];
                if (Array.isArray(orderData)) {
                    actualOrders = orderData;
                } else if (orderData?.data && Array.isArray(orderData.data)) {
                    actualOrders = orderData.data;
                } else if (orderData?.content && Array.isArray(orderData.content)) {
                    actualOrders = orderData.content;
                } else if (orderData?.data?.content && Array.isArray(orderData.data.content)) {
                    actualOrders = orderData.data.content;
                }

                console.log("2. MẢNG ĐƠN HÀNG TÌM ĐƯỢC:", actualOrders);
                // ===============================================
                
                const sortedOrders = actualOrders.sort((a, b) => b.id - a.id);
                setOrders(sortedOrders);

            } catch (error) {
                console.error("3. LỖI KHI TẢI ĐƠN HÀNG:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [token, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING': return { icon: Clock, color: '#f59e0b', text: 'Chờ xử lý', bg: '#fef3c7' };
            case 'PAID': return { icon: Wallet, color: '#3b82f6', text: 'Đã thanh toán', bg: '#eff6ff' };
            case 'DELIVERIED': return { icon: Truck, color: '#8b5cf6', text: 'Đang giao hàng', bg: '#ede9fe' };
            case 'COMPLETED': return { icon: CheckCircle, color: '#10b981', text: 'Hoàn thành', bg: '#d1fae5' };
            case 'CANCELED': return { icon: XCircle, color: '#ef4444', text: 'Đã hủy', bg: '#fee2e2' };
            default: return { icon: Package, color: '#64748b', text: 'Chờ xử lý', bg: '#f1f5f9' };
        }
    };

    if (isLoading) return <div className="loading-state">Đang tải dữ liệu của bạn...</div>;

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <div className="user-brief">
                    <div className="avatar-circle">
                        {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3>{userInfo?.username || 'Khách hàng'}</h3>
                    <p>{userInfo?.role || 'USER'}</p>
                </div>

                <nav className="profile-nav">
                    <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
                        <User size={20} /> Thông tin tài khoản
                    </button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <Package size={20} /> Lịch sử mua hàng
                    </button>
                    <button onClick={() => navigate('/cart')}>
                        <ShoppingCart size={20} /> Đi đến Giỏ hàng
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} /> Đăng xuất
                    </button>
                </nav>
            </aside>

            <main className="profile-content">
                {activeTab === 'info' && (
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="info-tab">
                        <h2>Hồ sơ của tôi</h2>
                        <p className="subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                        
                        <div className="info-form">
                            <div className="form-group">
                                <label>Tên đăng nhập</label>
                                <input type="text" value={userInfo?.username || ''} readOnly disabled />
                            </div>
                            <div className="form-group">
                                <label>ID Tài khoản</label>
                                <input type="text" value={`#${userInfo?.id || ''}`} readOnly disabled />
                            </div>
                            <div className="form-group">
                                <label>Chức vụ</label>
                                <input type="text" value={userInfo?.role || 'USER'} readOnly disabled />
                            </div>
                            <button className="primary-btn" onClick={() => alert('Tính năng cập nhật thông tin đang được bảo trì!')}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="orders-tab">
                        <h2>Lịch sử mua hàng</h2>
                        
                        {orders.length === 0 ? (
                            <div className="empty-state">
                                <Package size={60} color="#cbd5e1" />
                                <h3>Chưa có đơn hàng nào</h3>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map((order) => {
                                    const StatusConfig = getStatusConfig(order.orderStatus);
                                    const StatusIcon = StatusConfig.icon;

                                    return (
                                        <div key={order.id} className="order-card">
                                            <div className="order-header">
                                                <div className="order-id">Mã đơn: #{order.id}</div>
                                                <div className="order-status" style={{ color: StatusConfig.color, backgroundColor: StatusConfig.bg }}>
                                                    <StatusIcon size={16} /> {StatusConfig.text}
                                                </div>
                                            </div>
                                            
                                            <div className="order-details">
                                                <div className="detail-col">
                                                    <p className="label">Ngày đặt</p>
                                                    <p className="value">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <div className="detail-col">
                                                    <p className="label">Thanh toán</p>
                                                    <p className="value">{order.paymentMethod === 'DIRECT' ? 'Tiền mặt (COD)' : 'Ví MoMo'}</p>
                                                </div>
                                                <div className="detail-col total-col">
                                                    <p className="label">Tổng tiền</p>
                                                    <p className="value total">{order.totalPrice.toLocaleString()} đ</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default UserProfile;