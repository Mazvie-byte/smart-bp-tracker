import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get the current logged-in username from localStorage.
 */
export function getUsername() {
  return localStorage.getItem('bp_username') || 'guest';
}

/**
 * Create an axios instance that auto-appends ?username= to all requests.
 */
function createAPI() {
  const instance = axios.create({ baseURL: API_BASE });

  instance.interceptors.request.use((config) => {
    const username = getUsername();
    if (!config.params) config.params = {};
    if (!config.params.username) config.params.username = username;
    return config;
  });

  return instance;
}

const api = createAPI();
export default api;
