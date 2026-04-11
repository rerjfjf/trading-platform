/**
 * Публичные URL для деплоя: задайте в .env (Create React App):
 * REACT_APP_API_URL=https://api.example.com
 * REACT_APP_AUTH_URL=https://auth.example.com
 */
const trimSlash = (s) => s.replace(/\/+$/, "");

export const API_BASE_URL = trimSlash(
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
);

export const AUTH_API_BASE = trimSlash(
  process.env.REACT_APP_AUTH_URL || "http://127.0.0.1:3001"
);

export const AUTH_API = `${AUTH_API_BASE}/auth`;
