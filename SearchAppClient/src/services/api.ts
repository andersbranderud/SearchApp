import axios from 'axios';
import { SearchRequest, SearchResult, RegisterRequest, LoginRequest, AuthResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptor for auth token
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
  
  getUsername: (): string | null => {
    return localStorage.getItem('username');
  }
};

export const searchApi = {
  search: async (query: string, searchEngines: string[]): Promise<SearchResult> => {
    const response = await axiosInstance.post<SearchResult>('/search', {
      query,
      searchEngines
    } as SearchRequest);
    return response.data;
  },
  
  getAvailableEngines: async (): Promise<string[]> => {
    const response = await axiosInstance.get<string[]>('/search/engines');
    return response.data;
  }
};
