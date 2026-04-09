import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Rất quan trọng để lưu JWT refresh-token vào cookie
});

export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data; 
    } catch (error) {
        throw error.response?.data?.message || 'Login failed! Please check your credentials.';
    }
};
export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Registration failed! Please try again.';
    }
};