import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';
const createApiClient = (token) => axios.create({
    baseURL: BASE_URL,
    headers: { 'Authorization': `Bearer ${token}` }
});

// 1. Admin lấy danh sách User
export const getAllUsers = async (token) => {
    try {
        const response = await createApiClient(token).get('/api/admin/users');
        return response.data;
    } catch (error) {
        console.error("Chưa có API lấy User", error);
        return []; // Tạm trả về mảng rỗng nếu BE chưa có
    }
};

// 2. Admin Khóa / Mở khóa tài khoản
export const toggleUserStatus = async (token, userId) => {
    try {
        // Gọi API cập nhật trạng thái User (Gửi cho BE làm endpoint này)
        const response = await createApiClient(token).put(`/api/admin/users/${userId}/toggle-status`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi cập nhật trạng thái User';
    }
};

// 3. Lấy thống kê (Thêm sellerId nếu Admin muốn xem của shop khác)
export const getMonthlyStats = async (token, sellerId = '') => {
    try {
        const url = sellerId ? `/api/statistic/month?sellerId=${sellerId}` : `/api/statistic/month`;
        const response = await createApiClient(token).get(url);
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy thống kê", error);
        return null;
    }
};