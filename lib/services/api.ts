import axios from 'axios';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/lib/models/auth';
import { useAppStore } from '@/app/store/store';
import { debugApi, debugTime } from '@/lib/utils/debug';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

debugApi('API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const timer = debugTime('api', `${config.method?.toUpperCase()} ${config.url}`);
    
    debugApi('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params,
      headers: config.headers,
    });

    // Adding timing information to the request
    config.__debugTimer = timer;
    
    return config;
  },
  (error) => {
    debugApi('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // End the timer if exists
    if (response.config.__debugTimer) {
      response.config.__debugTimer.end();
    }
    
    debugApi('API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    
    return response;
  },
  (error) => {
    // End the timer if exists
    if (error.config?.__debugTimer) {
      error.config.__debugTimer.end();
    }
    
    debugApi('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    debugApi('Adding auth token to request');
  }
  
  return config;
});

// Declare the __debugTimer property for TypeScript
declare module 'axios' {
  interface AxiosRequestConfig {
    __debugTimer?: { end: () => void };
  }
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    
    if (data.profile_image) {
      formData.append('profile_image', data.profile_image);
    }
    
    const response = await axios.post<RegisterResponse>(
      `${API_BASE_URL}/auth/register`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': '*/*',
        }
      }
    );
    
    return response.data;
  }
}; 