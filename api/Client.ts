import axios from 'axios';

const CAT_API_KEY = process.env.EXPO_PUBLIC_CAT_API_KEY;

const apiClient = axios.create({
  baseURL: 'https://api.thecatapi.com/v1',
  headers: {
    'x-api-key': CAT_API_KEY, // Replace with your actual API key
  },
});

export default apiClient;
