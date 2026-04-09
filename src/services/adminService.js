import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';
const createApiClient = (token) => axios.create({
    baseURL: BASE_URL,
    headers: { 'Authorization': `Bearer ${token}` }
});

// Admin lấy danh sách User (BE cần làm thêm API này)
export const getAllUsers = async (token) => {
    try {
        const response = await createApiClient(token).get('/api/admin/users');
        return response.data;
    } catch (error) {
        console.error("Chưa có API lấy User", error);
        return []; // Tạm trả về mảng rỗng nếu BE chưa có
    }
};

// Lấy thống kê (Thêm sellerId nếu Admin muốn xem của shop khác)
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