import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';

export const getCurrentUser = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data; // Trả về UserDTO chứa id [cite: 394-396]
    } catch (error) {
        throw error.response?.data?.message || 'Không thể lấy thông tin người dùng';
    }
};