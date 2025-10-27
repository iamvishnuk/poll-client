import axios from 'axios';

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 5000
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        status: 'error',
        message: 'Network Error'
      });
    }

    const { data } = error.response;

    return Promise.reject({
      status: data.status || 'error',
      message: data.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' &&
        data.stack && { stack: data.stack })
    });
  }
);

export default API;
