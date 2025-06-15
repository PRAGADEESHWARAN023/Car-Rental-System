import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:8000/api/', // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
http.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token'); // Adjust based on your token storage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default http;
