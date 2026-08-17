import axios from 'axios';
import { getSession } from 'next-auth/react';

// Ensure baseURL points to /api/v1 (stripping any accidental trailing /admin or slashes)
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.citycarcenters.com/api/v1';
const baseURL = rawUrl.replace(/\/admin\/?$/, '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic request interceptor: Ensures every API request contains a valid token
api.interceptors.request.use(async (config) => {
  if (!config.headers['Authorization'] && typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session?.backendToken) {
        config.headers['Authorization'] = `Bearer ${session.backendToken}`;
      }
    } catch (err) {
      console.error('Failed to attach NextAuth token in request interceptor:', err);
    }
  }
  return config;
});

// Response interceptor: handle token expiration if needed
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

