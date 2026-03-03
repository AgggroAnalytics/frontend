import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const client = axios.create({
  baseURL: '/api/v1',
});

client.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      try {
        const refreshed = await authStore.keycloak?.updateToken(30);
        if (refreshed && error.config) {
          error.config.headers.Authorization = `Bearer ${authStore.token}`;
          return client.request(error.config);
        }
      } catch {
        authStore.keycloak?.login();
      }
    }
    return Promise.reject(error);
  },
);

export default client;
