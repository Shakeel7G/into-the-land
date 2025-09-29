// src/services/api.js 
// This file is used to create an Axios instance for API calls
// It sets the base URL for the API and configures it to not send credentials by default
import axios from 'axios';

const BASE = process.env.VUE_APP_BACKEND_URL || 'http://localhost:4000'; // this allows the base URL to be set via an environment variable, defaulting to localhost if not set
// This is useful for development and production environments where the backend URL may differ 

console.log('Backend URL is:', process.env.VUE_APP_BACKEND_URL);
export default axios.create({
  baseURL: BASE + '/api',
  withCredentials: false
});

