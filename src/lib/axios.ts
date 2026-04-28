import axios from 'axios';
import Config from 'react-native-config';

const API_BASE_URL = Config.METAL_PRICE_API_BASE_URL || 'https://api.metalpriceapi.com/v1';
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});
