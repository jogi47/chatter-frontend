import axios from 'axios';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/lib/models/auth';
import { useAppStore } from '@/app/store/store';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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