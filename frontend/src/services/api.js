// In development, Vite proxies /api → http://localhost:5001 (see vite.config.js).
// In production, set VITE_API_URL to your deployed backend URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

const fetchWithTimeout = (url, ms = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
};

export const getAsteroids = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithTimeout(`${BASE_URL}/api/asteroids${query ? `?${query}` : ""}`)
    .then(handleResponse);
};

export const getApod = (date) =>
  fetchWithTimeout(`${BASE_URL}/api/apod${date ? `?date=${date}` : ""}`)
    .then(handleResponse);
