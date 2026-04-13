import axios from "axios";

const NASA_NEO_URL = "https://api.nasa.gov/neo/rest/v1/feed";
const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";
const TIMEOUT_MS = 25000;

const getApiKey = () => {
  const apiKey = process.env.NASA_API_KEY;
  if (!apiKey) throw new Error("NASA_API_KEY is missing from environment variables");
  return apiKey;
};

export const fetchNearEarthObjects = async ({ startDate, endDate } = {}) => {
  try {
    const params = { api_key: getApiKey() };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get(NASA_NEO_URL, { params, timeout: TIMEOUT_MS });
    return response.data?.near_earth_objects ?? {};
  } catch (error) {
    const message =
      error.response?.data?.error_message ||
      error.response?.data?.message ||
      error.message;
    throw new Error(`NASA NeoWs API request failed: ${message}`);
  }
};

export const fetchApod = async (date) => {
  try {
    const params = { api_key: getApiKey() };
    if (date) params.date = date;
    const response = await axios.get(NASA_APOD_URL, { params, timeout: TIMEOUT_MS });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error_message ||
      error.response?.data?.message ||
      error.message;
    throw new Error(`NASA APOD API request failed: ${message}`);
  }
};
