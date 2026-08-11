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

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
