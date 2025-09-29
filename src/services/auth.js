// src/services/auth.js
import api from './api.js';

// Register new user
export const registerUser = (userData) => {
  return api.post('/register', userData);
};

// Login user
export const loginUser = (credentials) => {
  return api.post('/login', credentials);
};

