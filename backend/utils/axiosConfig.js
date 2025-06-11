import axios from 'axios';

const mt5Api = axios.create({
  baseURL: 'https://mt5.mtapi.io',
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
mt5Api.interceptors.request.use(config => {
  console.log(`Making request to ${config.url}`);
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
mt5Api.interceptors.response.use(response => {
  return response.data;
}, error => {
  if (error.code === 'ECONNABORTED') {
    error.message = 'MT5 API request timeout';
  }
  return Promise.reject(error);
});

export default mt5Api;