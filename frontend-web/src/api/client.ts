import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const redirectToLogin = () => {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const query = returnTo === "/login" ? "" : `?returnTo=${encodeURIComponent(returnTo)}`;
  window.location.assign(`/login${query}`);
};

const TOKEN_KEY = "lba.access";
const REFRESH_KEY = "lba.refresh";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach access token on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 (once per request)
let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      const refresh = tokenStore.getRefresh();
      if (!refresh) {
        const hadAccessToken = Boolean(tokenStore.get());
        tokenStore.clear();
        if (hadAccessToken) redirectToLogin();
        return Promise.reject(error);
      }

      original._retry = true;
      if (!refreshing) {
        refreshing = axios
          .post(`${API_BASE}/auth/token/refresh/`, { refresh })
          .then((res) => {
            const newAccess = res.data.access as string;
            tokenStore.set(newAccess);
            return newAccess;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      try {
        const newAccess = await refreshing;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        const hadAccessToken = Boolean(tokenStore.get());
        tokenStore.clear();
        if (hadAccessToken) redirectToLogin();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);