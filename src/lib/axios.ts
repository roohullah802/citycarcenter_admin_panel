import axios from 'axios';

// Ensure baseURL points to /api/v1 (stripping any accidental trailing /admin or slashes)
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.citycarcenters.com/api/v1';
const baseURL = rawUrl.replace(/\/admin\/?$/, '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic request interceptor: Ensures every API request contains a valid Clerk token
api.interceptors.request.use(async (config) => {
  if (!config.headers['Authorization'] && typeof window !== 'undefined' && (window as any).Clerk?.session) {
    try {
      const token = await (window as any).Clerk.session.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Failed to attach Clerk token in request interceptor:', err);
    }
  }
  return config;
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
