import axios from 'axios';

const BASE_URL = 'https://e-comerce-dt1r.onrender.com';

const createApiClient = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

export const getSellerProducts = async (token, sellerId, page = 0, size = 50) => {
    try {
        const response = await createApiClient(token).get(`/api/product/seller?sellerId=${sellerId}&page=${page}&size=${size}`);
        return response.data; // Trả về List<ProductDTO> [cite: 301-304]
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm';
    }
};

export const createProduct = async (token, sellerId, productData) => {
    try {
        const response = await createApiClient(token).post(`/api/product?sellerId=${sellerId}`, productData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi tạo sản phẩm';
    }
};

export const uploadProductImages = async (token, productId, files) => {
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        // Nạp tất cả các file ảnh vào formData với key là 'image' (Khớp với @RequestPart("image") ở backend)
        files.forEach(file => {
            formData.append('image', file);
        });

        const response = await createApiClient(token).post('/api/product/imgs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi upload ảnh';
    }
};

export const deleteProduct = async (token, sellerId, productId) => {
    try {
        const response = await createApiClient(token).delete(`/api/product/${productId}?sellerId=${sellerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi xóa sản phẩm';
    }
};

export const updateProduct = async (token, sellerId, productId, productData) => {
    try {
        const response = await createApiClient(token).put(`/api/product/update?sellerId=${sellerId}&id=${productId}`, productData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm';
    }
};

// Lấy tất cả sản phẩm đang bán (Không cần token)
export const getAllActiveProducts = async (token, page = 0, size = 50) => {
    try {
        // Nếu có token thì dùng createApiClient, nếu không thì dùng axios bình thường
        const client = token ? createApiClient(token) : axios.create({ baseURL: BASE_URL });
        const response = await client.get(`/api/product?page=${page}&size=${size}`);
        return response.data; 
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm';
    }
};

// Lấy comment của 1 sản phẩm
export const getProductComments = async (token, productId) => {
    try {
        const response = await createApiClient(token).get(`/api/product/comment?productId=${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi tải bình luận';
    }
};

// Viết comment
export const writeComment = async (token, userId, productId, content) => {
    try {
        const response = await createApiClient(token).post(`/api/product/comment/write?userId=${userId}&productId=${productId}`, { content });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Lỗi khi gửi bình luận';
    }
};