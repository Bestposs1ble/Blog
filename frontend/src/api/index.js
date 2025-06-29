import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 请求拦截器：自动携带token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default instance;