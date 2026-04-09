import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';

const createApiClient = (token) => axios.create({
    baseURL: BASE_URL,
    headers: { 'Authorization': `Bearer ${token}` }
});

// 1. Tạo đơn hàng vào Database
export const createOrder = async (token, userId, orderData) => {
    try {
        const response = await createApiClient(token).post(`/api/order/create?userId=${userId}`, orderData);
        return response.data; 
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi tạo đơn hàng';
    }
};

// 2. Gọi API Momo để lấy link thanh toán
export const createMomoPayment = async (token, orderId) => {
    try {
        const response = await createApiClient(token).post(`/api/order/momo/create?orderId=${orderId}`);
        return response.data; 
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi tạo thanh toán Momo';
    }
};

// 3. Lấy lịch sử đơn hàng của 1 User
export const getUserOrders = async (token, userId, page = 0, size = 50) => {
    try {
        const response = await createApiClient(token).get(`/api/order/user?userId=${userId}&page=${page}&size=${size}`);
        return response.data; 
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi lấy lịch sử đơn hàng';
    }
};

// 4. Lấy danh sách đơn hàng cho Seller (Chuẩn - Đã gộp)
export const getSellerOrders = async (token, sellerId) => {
    try {
        const response = await createApiClient(token).get(`/api/order/seller?sellerId=${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng của Seller';
    }
};

// 5. Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (token, orderId, status) => {
    try {
        const response = await createApiClient(token).put(`/api/order/update/status?orderId=${orderId}&status=${status}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi cập nhật trạng thái';
    }
};

// 6. Hủy đơn hàng
export const cancelOrder = async (token, orderId) => {
    try {
        const response = await createApiClient(token).delete(`/api/order/cancel?id=${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi hủy đơn hàng';
    }
};