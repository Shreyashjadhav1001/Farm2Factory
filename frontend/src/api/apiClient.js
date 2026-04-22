import axios from 'axios';

// baseURL is now centrally managed in main.jsx via axios.defaults.baseURL
// but we keep the structure for compatibility if needed.
const API_URL = axios.defaults.baseURL + '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllDemands = () => apiClient.get('/demands/all');
export const getFarmerDashboard = () => apiClient.get('/farmer/dashboard');
export const updateContribution = (id, data) => apiClient.put(`/farmer/contribution/update/${id}`, data);
export default apiClient;
