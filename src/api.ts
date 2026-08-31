import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}
const API_BASE_URL = rawUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export default API_BASE_URL;
