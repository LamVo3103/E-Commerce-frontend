import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, Package, Settings, LogOut, Lock, Unlock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMonthlyProfit, getTopProducts } from '../../services/statisticService';
// === IMPORT THÊM HÀM TỪ ADMIN SERVICE ===
import { getAllUsers, toggleUserStatus } from '../../services/adminService'; 
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    
    // State lưu dữ liệu thật từ API cho Overview
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [topProducts, setTopProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // === STATE CHO TAB QUẢN LÝ USER ===
    const [users, setUsers] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(false);

    // State cho Modal thống kê Seller
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [sellerStats, setSellerStats] = useState({ total: 0, orders: 0 });
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    const handleLogout = () => {
        logout(); 
        navigate('/auth'); 
    };

    // Load data Overview
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [profitData, productsData] = await Promise.all([
                    getMonthlyProfit(token),
                    getTopProducts(token)
                ]);
                setMonthlyTotal(profitData.total || 0);
                setOrderCount(profitData.order?.length || 0);
                setTopProducts(productsData || []);
            } catch (error) {
                console.error("Lỗi tải dữ liệu dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token && activeTab === 'overview') {
            fetchDashboardData();
        }
    }, [token, activeTab]);

    // === LOAD DATA DANH SÁCH USER (DÙNG API THẬT) ===
    const fetchUsersList = async () => {
        setIsUsersLoading(true);
        try {
            const data = await getAllUsers(token);
            // Đề phòng BE trả về dạng phân trang (có content) hoặc mảng thuần
            const actualUsers = Array.isArray(data) ? data : (data.content || []);
            setUsers(actualUsers);
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
        } finally {
            setIsUsersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users' && token) {
            fetchUsersList();
        }
    }, [activeTab, token]);

    // === HÀM XỬ LÝ KHÓA / MỞ KHÓA USER ===
    const handleToggleUserLock = async (userId, currentStatus) => {
        const actionText = currentStatus ? 'KHÓA' : 'MỞ KHÓA';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;

        try {
            await toggleUserStatus(token, userId);
            alert(`${actionText} tài khoản thành công!`);
            fetchUsersList(); // Load lại danh sách sau khi khóa
        } catch (error) {
            alert(error || 'Chức năng đang chờ Backend hoàn thiện API!');
        }
    };

    // Hàm xử lý xem thống kê riêng của Seller (Chờ gắn vào nút bên Quản lý User)
    const handleViewSellerStats = async (sellerId, sellerName) => {
        setSelectedSeller(sellerName);
        setIsStatsModalOpen(true);
        setIsStatsLoading(true);
        try {
            const data = await getMonthlyProfit(token, sellerId);
            setSellerStats({
                total: data.total || 0,
                orders: data.order?.length || 0
            });
        } catch (error) {
            console.error("Lỗi lấy thống kê shop:", error);
            setSellerStats({ total: 0, orders: 0 });
        } finally {
            setIsStatsLoading(false);
        }
    };

    const statsData = [
        { id: 1, title: "Doanh thu tháng này", value: `${monthlyTotal.toLocaleString()} đ`, icon: DollarSign, color: "var(--success-color)" },
        { id: 2, title: "Đơn hàng tháng này", value: orderCount.toString(), icon: ShoppingBag, color: "var(--primary-color)" },
        { id: 3, title: "Tổng số người dùng", value: users.length > 0 ? users.length.toString() : "N/A", icon: Users, color: "#f59e0b" }, 
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={20} /> Tổng quan
                    </button>
                    <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={20} /> Quản lý Người dùng
                    </button>
                    <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                        <Settings size={20} /> Cài đặt
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-btn logout-btn" onClick={handleLogout}>
                        <LogOut size={20} /> Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-topbar">
                    <h2>Welcome back, Admin!</h2>
                </div>

                {/* --- TAB OVERVIEW --- */}
                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        {isLoading ? (
                            <div className="loading-state">Loading real-time data...</div>
                        ) : (
                            <>
                                <motion.div className="stats-grid" variants={containerVariants} initial="hidden" animate="show">
                                    {statsData.map((stat) => {
                                        const Icon = stat.icon;
                                        return (
                                            <motion.div key={stat.id} variants={cardVariants} className="stat-card">
                                                <div className="stat-info">
                                                    <p className="stat-title">{stat.title}</p>
                                                    <h3 className="stat-value">{stat.value}</h3>
                                                </div>
                                                <div className="stat-icon-wrap" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                                    <Icon size={24} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                <motion.div className="recent-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                                    <div className="recent-header">
                                        <h3>Sản phẩm bán chạy nhất</h3>
                                    </div>
                                    
                                    {topProducts.length === 0 ? (
                                        <div className="empty-state">
                                            <Package size={48} color="#cbd5e1" style={{marginBottom: '16px'}}/>
                                            <p>Chưa có sản phẩm nào được bán.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="custom-table">
                                                <thead>
                                                    <tr>
                                                        <th>Product ID</th>
                                                        <th>Product Name</th>
                                                        <th>Total Sold</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topProducts.map((product) => (
                                                        <tr key={product.id}>
                                                            <td className="fw-500">#{product.id}</td>
                                                            <td>{product.name}</td>
                                                            <td>
                                                                <span className="badge-success">{product.totalSold} items</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </div>
                )}

                {/* --- TAB QUẢN LÝ USERS --- */}
                {activeTab === 'users' && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="dashboard-content">
                        <div className="content-header" style={{ marginBottom: '20px' }}>
                            <h3>Quản lý Tài khoản ({users.length})</h3>
                            <button className="outline-btn" onClick={fetchUsersList}>Làm mới</button>
                        </div>
                        
                        {isUsersLoading ? (
                            <div className="loading-state">Đang tải danh sách người dùng...</div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">Chưa có người dùng nào (Hoặc BE chưa làm API).</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tài khoản</th>
                                            <th>Email</th>
                                            <th>Vai trò</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td className="fw-500">#{u.id}</td>
                                                <td>{u.username}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className="category-tag" style={{ background: u.role === 'SELLER' ? '#e0e7ff' : '#f1f5f9' }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    {/* Kiểm tra thuộc tính isActive từ DB */}
                                                    {u.isActive || u.active || u.status === 'ACTIVE' ? 
                                                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16}/> Active</span> : 
                                                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16}/> Locked</span>
                                                    }
                                                </td>
                                                <td>
                                                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                                                        {/* Nếu là Seller thì hiện nút xem Thống kê */}
                                                        {u.role === 'SELLER' && (
                                                            <button 
                                                                className="outline-btn" 
                                                                style={{padding: '4px 8px', fontSize: '12px'}}
                                                                onClick={() => handleViewSellerStats(u.id, u.username)}
                                                            >
                                                                <TrendingUp size={14} style={{marginRight: '4px'}}/> Stats
                                                            </button>
                                                        )}

                                                        {/* Nút Khóa / Mở khóa */}
                                                        <button 
                                                            className="icon-btn edit-btn" 
                                                            title={u.isActive ? "Khóa tài khoản" : "Mở khóa"}
                                                            onClick={() => handleToggleUserLock(u.id, u.isActive)}
                                                        >
                                                            {u.isActive ? <Lock size={18} color="#ef4444"/> : <Unlock size={18} color="#10b981"/>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- TAB SETTINGS --- */}
                {activeTab === 'settings' && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="dashboard-content" style={{ maxWidth: '800px' }}>
                        <h3>Cài đặt Hệ thống</h3>
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginTop: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên Website</label>
                                <input type="text" defaultValue="E-Commerce Pro" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phí hoa hồng sàn (%)</label>
                                <input type="number" defaultValue="5" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontWeight: '500', color: '#ef4444' }}>Bật chế độ bảo trì (Bảo vệ toàn trang)</span>
                                </label>
                            </div>
                            <button className="primary-btn">Lưu Cài Đặt</button>
                        </div>
                    </motion.div>
                )}

                {/* === MODAL THỐNG KÊ SELLER === */}
                {isStatsModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsStatsModalOpen(false)}>
                        <motion.div 
                            className="stats-modal" 
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="modal-header">
                                <h3>Thống kê Shop: <span style={{color: '#6366f1'}}>{selectedSeller}</span></h3>
                                <button className="close-btn" onClick={() => setIsStatsModalOpen(false)}>
                                    <XCircle size={24} />
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                {isStatsLoading ? (
                                    <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</p>
                                ) : (
                                    <div className="stats-modal-grid">
                                        <div className="stat-card mini">
                                            <p className="stat-title">Doanh thu tháng này</p>
                                            <h3 className="stat-value" style={{color: 'var(--success-color)'}}>
                                                {sellerStats.total.toLocaleString()} đ
                                            </h3>
                                        </div>
                                        <div className="stat-card mini">
                                            <p className="stat-title">Số đơn hàng</p>
                                            <h3 className="stat-value" style={{color: 'var(--primary-color)'}}>
                                                {sellerStats.orders} Đơn
                                            </h3>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;