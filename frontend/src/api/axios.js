import axios from 'axios';

const API = axios.create({
  baseURL: 'https://thefolio-api-u4i3.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default API;