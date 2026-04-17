import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, PlusCircle, ClipboardList, LogOut, Edit, Trash2, Image as ImageIcon, UploadCloud, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/userService';
import { getSellerProducts, createProduct, uploadProductImages, deleteProduct, updateProduct } from '../../services/productService';
import { getSellerOrders, cancelOrder } from '../../services/orderService';
import { getMonthlyProfit, getTopProducts } from '../../services/statisticService';
import './SellerDashboard.css';

const SellerDashboard = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my_products');
    
    const [sellerId, setSellerId] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState({ type: '', text: '' });
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', sellPrice: '', stock: '', category: '', color: '', size: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // === STATE CHO THỐNG KÊ VÀ TOP SẢN PHẨM ===
    const [sellerStats, setSellerStats] = useState({ total: 0, orders: 0 });
    const [topProducts, setTopProducts] = useState([]); // State chứa sản phẩm top
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const fetchSellerData = async () => {
        setIsLoading(true);
        try {
            const user = await getCurrentUser(token);
            setSellerId(user.id);
            const productList = await getSellerProducts(token, user.id, 0, 50);
            setProducts(productList);
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrdersData = async () => {
        if (!sellerId) return; 
        try {
            const data = await getSellerOrders(token, sellerId); 
            const actualOrders = Array.isArray(data) ? data : (data.content || []);
            setOrders(actualOrders.sort((a, b) => b.id - a.id)); 
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        }
    };

    // === HÀM LẤY DỮ LIỆU THỐNG KÊ + TOP SẢN PHẨM ===
    const fetchStatsData = async () => {
        if (!sellerId) return;
        setIsStatsLoading(true);
        try {
            // Gọi 2 API song song để tiết kiệm thời gian chờ
            const [profitData, productsData] = await Promise.all([
                getMonthlyProfit(token, sellerId),
                getTopProducts(token, sellerId)
            ]);
            
            setSellerStats({
                total: profitData.total || 0,
                orders: profitData.order?.length || 0
            });
            setTopProducts(productsData || []); 
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        } finally {
            setIsStatsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSellerData();
    }, [token]);

    useEffect(() => {
        if (activeTab === 'statistics') {
            fetchStatsData();
        }
    }, [activeTab, sellerId, token]);

    const handleDeleteClick = async (productId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
        try {
            await deleteProduct(token, sellerId, productId);
            alert('Xóa sản phẩm thành công!');
            fetchSellerData(); 
        } catch (error) {
            alert(error); 
        }
    };

    const handleEditClick = (product) => {
        const cat = product.categories && product.categories.length > 0 ? product.categories[0].name : '';
        let col = '', siz = '';
        if (product.attributes) {
            const colorAttr = product.attributes.find(a => a.name === 'Màu sắc');
            if (colorAttr && colorAttr.value.length > 0) col = colorAttr.value[0];
            const sizeAttr = product.attributes.find(a => a.name === 'Kích thước');
            if (sizeAttr && sizeAttr.value.length > 0) siz = sizeAttr.value[0];
        }

        setFormData({ name: product.name, sellPrice: product.sellPrice, stock: product.stock, category: cat, color: col, size: siz });
        setEditingProduct(product);
        setFormMsg({ type: '', text: '' });
        setSelectedFiles([]);
        setActiveTab('add_product');
    };

    const handleTabChange = (tab) => {
        if (tab === 'add_product' && !editingProduct) {
            setFormData({ name: '', sellPrice: '', stock: '', category: '', color: '', size: '' });
            setEditingProduct(null);
            setSelectedFiles([]);
            setFormMsg({ type: '', text: '' });
        }
        if (tab === 'orders') {
            fetchOrdersData(); 
        }
        setActiveTab(tab);
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setSelectedFiles(Array.from(e.target.files));

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        if (!editingProduct && selectedFiles.length === 0) {
            setFormMsg({ type: 'error', text: 'Vui lòng chọn ít nhất 1 ảnh sản phẩm!' });
            return;
        }

        setIsSubmitting(true);
        setFormMsg({ type: '', text: '' });

        try {
            const dynamicAttributes = [];
            if (formData.color && formData.color.trim() !== '') dynamicAttributes.push({ name: "Màu sắc", value: [formData.color.trim()] });
            if (formData.size && formData.size.trim() !== '') dynamicAttributes.push({ name: "Kích thước", value: [formData.size.trim()] });

            const productDTO = {
                name: formData.name, sellPrice: parseFloat(formData.sellPrice), stock: parseInt(formData.stock),
                categories: [{ name: formData.category }], attributes: dynamicAttributes,
                img: editingProduct && selectedFiles.length === 0 ? editingProduct.img : ["temp_placeholder"] 
            };

            if (editingProduct) {
                const updatedProduct = await updateProduct(token, sellerId, editingProduct.id, productDTO);
                if (selectedFiles.length > 0) await uploadProductImages(token, updatedProduct.id, selectedFiles);
                setFormMsg({ type: 'success', text: 'Cập nhật sản phẩm thành công!' });
            } else {
                const newProduct = await createProduct(token, sellerId, productDTO);
                await uploadProductImages(token, newProduct.id, selectedFiles);
                setFormMsg({ type: 'success', text: 'Thêm sản phẩm thành công!' });
            }
            
            setFormData({ name: '', sellPrice: '', stock: '', category: '', color: '', size: '' });
            setSelectedFiles([]);
            setEditingProduct(null);
            
            fetchSellerData();
            setTimeout(() => handleTabChange('my_products'), 1500);

        } catch (error) {
            setFormMsg({ type: 'error', text: error });
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const rowVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

    return (
        <div className="seller-layout">
            <aside className="seller-sidebar">
                <div className="sidebar-header"><h3>Quản lý cửa hàng</h3></div>
                <nav className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'my_products' ? 'active' : ''}`} onClick={() => { setEditingProduct(null); handleTabChange('my_products'); }}>
                        <Package size={20} /> Các sản phẩm
                    </button>
                    <button className={`nav-btn ${activeTab === 'add_product' && !editingProduct ? 'active' : ''}`} onClick={() => { setEditingProduct(null); handleTabChange('add_product'); }}>
                        <PlusCircle size={20} /> Thêm sản phẩm
                    </button>
                    <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}>
                        <ClipboardList size={20} /> Quản lý đơn hàng
                    </button>
                    <button className={`nav-btn ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => handleTabChange('statistics')}>
                        <TrendingUp size={20} /> Thống kê doanh thu
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-btn logout-btn" onClick={handleLogout}>
                        <LogOut size={20} /> Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="seller-main">
                <div className="seller-topbar">
                    <h2>Quản lý cửa hàng</h2>
                </div>

                {/* TAB 1: MY PRODUCTS */}
                {activeTab === 'my_products' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h3>Các sản phẩm ({products.length})</h3>
                            <button className="primary-btn" onClick={() => { setEditingProduct(null); handleTabChange('add_product'); }}>
                                <PlusCircle size={18} /> Thêm sản phẩm
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="loading-state">Loading your products...</div>
                        ) : products.length === 0 ? (
                            <div className="empty-state">
                                <Package size={48} color="#cbd5e1" style={{marginBottom: '16px'}}/>
                                <p>Bạn chưa đăng sản phẩm nào.</p>
                                <button className="outline-btn" onClick={() => { setEditingProduct(null); handleTabChange('add_product'); }}>Bắt đầu bán hàng</button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <motion.table className="custom-table" variants={tableVariants} initial="hidden" animate="show">
                                    <thead>
                                        <tr>
                                            <th>Ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Giá</th>
                                            <th>Kho</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <motion.tr key={product.id} variants={rowVariants}>
                                                <td>
                                                    {product.img && product.img.length > 0 ? (
                                                        <img src={product.img[0]} alt={product.name} className="product-thumb" />
                                                    ) : (
                                                        <div className="product-thumb placeholder"><ImageIcon size={20}/></div>
                                                    )}
                                                </td>
                                                <td className="fw-500 product-name-cell">{product.name}</td>
                                                <td className="price-cell">{product.sellPrice.toLocaleString()} đ</td>
                                                <td>
                                                    <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                                                        {product.stock} items
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="icon-btn edit-btn" title="Edit" onClick={() => handleEditClick(product)}><Edit size={18}/></button>
                                                        <button className="icon-btn delete-btn" title="Delete" onClick={() => handleDeleteClick(product.id)}><Trash2 size={18}/></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </motion.table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: ADD PRODUCT */}
                {activeTab === 'add_product' && (
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="add-product-container">
                        <div className="content-header">
                            <h3>{editingProduct ? `Edit Product: #${editingProduct.id}` : 'Create New Product'}</h3>
                            {editingProduct && (
                                <button className="outline-btn" onClick={() => handleTabChange('my_products')} style={{marginTop: 0}}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        {formMsg.text && (
                            <div className={`form-message ${formMsg.type === 'error' ? 'error-msg' : 'success-msg'}`}>
                                {formMsg.text}
                            </div>
                        )}

                        <form className="add-product-form" onSubmit={handleSubmitProduct}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" required placeholder="Ex: Quần đùi thể thao" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" required placeholder="Ex: Thời trang nam" value={formData.category} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Selling Price (VND)</label>
                                    <input type="number" name="sellPrice" min="0" required placeholder="Ex: 150000" value={formData.sellPrice} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" name="stock" min="1" required placeholder="Ex: 100" value={formData.stock} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Color (Tùy chọn)</label>
                                    <input type="text" name="color" placeholder="Ex: Đen (Có thể bỏ trống)" value={formData.color} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Size (Tùy chọn)</label>
                                    <input type="text" name="size" placeholder="Ex: XL (Có thể bỏ trống)" value={formData.size} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Product Images {editingProduct ? "(Bỏ trống nếu muốn giữ ảnh cũ)" : "(Multiple allowed)"}</label>
                                <div className="file-upload-box">
                                    <input type="file" multiple accept="image/*" id="file-upload" onChange={handleFileChange} />
                                    <label htmlFor="file-upload" className="file-upload-label">
                                        <UploadCloud size={32} color="#6366f1" />
                                        <span>Click to browse new images</span>
                                    </label>
                                </div>
                                {selectedFiles.length > 0 && (
                                    <p className="file-count">{selectedFiles.length} file(s) selected for update.</p>
                                )}
                            </div>

                            <button type="submit" className="primary-btn submit-product-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (editingProduct ? 'Update Product' : 'Publish Product')}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* TAB 3: QUẢN LÝ ĐƠN HÀNG */}
                {activeTab === 'orders' && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="dashboard-content">
                        <div className="content-header">
                            <h3>Order Management</h3>
                            <button className="outline-btn" onClick={fetchOrdersData}>
                                Làm mới danh sách
                            </button>
                        </div>

                        {!orders || orders.length === 0 ? (
                            <div className="empty-state">
                                <ClipboardList size={48} color="#cbd5e1" style={{marginBottom: '16px'}}/>
                                <p>Cửa hàng của bạn chưa có đơn hàng nào.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Mã Đơn</th>
                                            <th>Khách hàng</th>
                                            <th>Ngày đặt</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="fw-500">#{order.id}</td>
                                                <td>{order.username || 'Khách Vãng Lai'}</td>
                                                <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                                <td className="price-cell">{order.totalPrice.toLocaleString()} đ</td>
                                                <td>
                                                    <span className="stock-badge" style={{
                                                        backgroundColor: order.orderStatus === 'CANCELED' ? '#fee2e2' : 
                                                                         order.orderStatus === 'COMPLETED' ? '#d1fae5' :
                                                                         order.orderStatus === 'DELIVERIED' ? '#ede9fe' : '#fef3c7',
                                                        color: order.orderStatus === 'CANCELED' ? '#ef4444' : 
                                                               order.orderStatus === 'COMPLETED' ? '#10b981' :
                                                               order.orderStatus === 'DELIVERIED' ? '#8b5cf6' : '#d97706'
                                                    }}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select 
                                                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                                            value={order.orderStatus}
                                                            onChange={async (e) => {
                                                                const newStatus = e.target.value;
                                                                if(window.confirm(`Bạn muốn đổi đơn #${order.id} sang trạng thái ${newStatus}?`)) {
                                                                    try {
                                                                        const { updateOrderStatus } = await import('../../services/orderService');
                                                                        await updateOrderStatus(token, order.id, newStatus);
                                                                        alert('Cập nhật trạng thái thành công!');
                                                                        fetchOrdersData(); 
                                                                    } catch (err) {
                                                                        alert(err);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <option value="PENDING">PENDING (Chờ xử lý)</option>
                                                            <option value="PAID">PAID (Đã thanh toán)</option>
                                                            <option value="DELIVERIED">DELIVERIED (Đang giao)</option>
                                                            <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
                                                            <option value="CANCELED">CANCELED (Đã hủy)</option>
                                                        </select>

                                                        {order.orderStatus !== 'CANCELED' && (
                                                            <button 
                                                                className="outline-btn" 
                                                                style={{padding: '6px 12px', fontSize: '13px', borderColor: '#ef4444', color: '#ef4444'}}
                                                                onClick={async () => {
                                                                    if(window.confirm(`Bạn có chắc chắn muốn HỦY đơn hàng #${order.id}?`)) {
                                                                        try {
                                                                            await cancelOrder(token, order.id);
                                                                            alert('Đã hủy đơn hàng thành công!');
                                                                            fetchOrdersData(); 
                                                                        } catch (e) { alert(e); }
                                                                    }
                                                                }}
                                                            >
                                                                Hủy Đơn
                                                            </button>
                                                        )}
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

                {/* --- TAB 4: THỐNG KÊ DOANH THU & TOP SẢN PHẨM --- */}
                {activeTab === 'statistics' && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="dashboard-content">
                        <div className="content-header">
                            <h3>Thống Kê Doanh Thu Cửa Hàng</h3>
                            <button className="outline-btn" onClick={fetchStatsData} disabled={isStatsLoading}>
                                {isStatsLoading ? 'Đang tải...' : 'Làm mới'}
                            </button>
                        </div>

                        {isStatsLoading ? (
                            <div className="loading-state">Đang lấy dữ liệu thống kê...</div>
                        ) : (
                            <>
                                {/* Card Thống kê với số liệu thật */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Tổng doanh thu dự kiến</p>
                                        <h2 style={{ fontSize: '28px', color: '#0f172a' }}>{sellerStats.total.toLocaleString()} đ</h2>
                                    </div>
                                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #6366f1' }}>
                                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Đơn hàng</p>
                                        <h2 style={{ fontSize: '28px', color: '#0f172a' }}>{sellerStats.orders} Đơn</h2>
                                    </div>
                                </div>

                                {/* BẢNG XẾP HẠNG SẢN PHẨM BÁN CHẠY (DỮ LIỆU THẬT) */}
                                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Sản phẩm bán chạy nhất</h4>
                                    <div className="table-responsive">
                                        <table className="custom-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tên sản phẩm</th>
                                                    <th>Đã bán</th>
                                                    <th>Doanh thu mang lại</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topProducts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                            Chưa có sản phẩm nào được bán ra.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    topProducts.map((product) => (
                                                        <tr key={product.id}>
                                                            <td className="fw-500">#{product.id}</td>
                                                            <td>{product.name}</td>
                                                            <td>
                                                                <span className="stock-badge in-stock" style={{ padding: '4px 8px' }}>
                                                                    {product.totalSold} items
                                                                </span>
                                                            </td>
                                                            <td className="price-cell">
                                                                {product.sellPrice 
                                                                    ? (product.sellPrice * product.totalSold).toLocaleString() + ' đ' 
                                                                    : 'Đang tính toán...'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default SellerDashboard;