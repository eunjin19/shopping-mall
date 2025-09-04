import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Axios 기본 설정
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 에러:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== 상품 관련 API =====
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data.data || response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data || response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data || response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data || response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// ===== 사용자 관련 API =====
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data || response.data;
};

export const getUserInfo = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data || response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data.data || response.data;
};

// ===== 장바구니 관련 API =====
export const getCart = async (userId) => {
  const response = await api.get(`/cart/${userId}`);
  return response.data.data || response.data;
};

export const getCartItems = async (userId) => {
  return getCart(userId);
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const response = await api.post('/cart', { user_id: userId, product_id: productId, quantity });
  return response.data.data || response.data;
};

// ===== 주문 내역 API =====
export const getOrderHistory = async (userId) => {
  const response = await api.get(`/orders/${userId}`);
  return response.data.data || response.data;
};

export default api;
