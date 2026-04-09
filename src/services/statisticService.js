import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';

const createApiClient = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}` // Backend của bạn yêu cầu Bearer token
        }
    });
};

// Thay thế hàm getMonthlyProfit cũ bằng hàm này:
export const getMonthlyProfit = async (token, sellerId = null) => {
    try {
        // Nếu có sellerId thì gắn vào URL, không thì gọi mặc định
        const url = sellerId ? `/api/statistic/month?sellerId=${sellerId}` : `/api/statistic/month`;
        const response = await createApiClient(token).get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi tải thống kê';
    }
};
export const getTopProducts = async (token, sellerId = null) => {
    try {
        const url = sellerId ? `/api/statistic/best?sellerId=${sellerId}` : `/api/statistic/best`;
        const response = await createApiClient(token).get(url);
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy top sản phẩm:", error);
        return [];
    }
};