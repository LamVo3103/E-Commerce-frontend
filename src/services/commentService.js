import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';

const createApiClient = (token) => axios.create({
    baseURL: BASE_URL,
    headers: { 'Authorization': `Bearer ${token}` }
});

export const getProductComments = async (token, productId) => {
    try {
        const response = await createApiClient(token).get(`/api/product/comment?productId=${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi tải đánh giá';
    }
};
// Viết comment mới
export const writeComment = async (token, userId, commentData) => {
    try {
        const response = await createApiClient(token).post(`/api/product/comment/write?userId=${userId}`, commentData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi gửi đánh giá';
    }
};