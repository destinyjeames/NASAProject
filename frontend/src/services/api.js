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

export const getAsteroids = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/asteroids${query ? `?${query}` : ""}`;
  return fetch(url).then(handleResponse);
};

export const getApod = (date) =>
  fetch(`${BASE_URL}/api/apod${date ? `?date=${date}` : ""}`).then(handleResponse);
