import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const createChat = async () => {
    const response = await api.post('/chat/create');
    return response.data;
}

export const getChats = async () => {
    const response = await api.get('/chat/get-all');
    return response.data;
}

export const getChat = async (chat_id) => {
    const response = await api.get(`chat/${chat_id}`);
    return response.data;
}

export const updateChat = async (chat_id, title) => {
    const response = await api.patch(`chat/${chat_id}`, { title });
    return response.data;
}

export const deleteChat = async (chat_id) => {
    const response = await api.delete(`chat/${chat_id}`);
    return response.data;
}

export default api;