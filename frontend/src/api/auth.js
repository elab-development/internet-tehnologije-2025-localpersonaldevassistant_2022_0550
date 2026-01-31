

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



export const register = async (email, fullName, password) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      full_name: fullName,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Registration failed';
  }
};


export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
   
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Login failed';
  }
};


export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to get user';
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


export const createGuest = async () => {
  try {
    const response = await api.post('/auth/guest');
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to create guest';
  }
};


export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};


export const getSavedUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default api;
