import axios from 'axios';

// 1. Dynamic Base URL
// - If deployed, it uses the URL from Render settings.
// - If local, it defaults to localhost:8000.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;