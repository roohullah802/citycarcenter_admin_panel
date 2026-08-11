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

// Response interceptor: Retry 401s once with a fresh Clerk token (handles expired/missing tokens)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined' &&
      (window as any).Clerk?.session
    ) {
      originalRequest._retry = true;
      try {
        const token = await (window as any).Clerk.session.getToken();
        if (token) {
          setAuthToken(token);
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (retryErr) {
        console.error('Token refresh retry failed:', retryErr);
      }
    }
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

