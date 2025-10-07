<template>
  <div class="auth-form">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input v-model="name" type="text" placeholder="First Name" required />
      <input v-model="surname" type="text" placeholder="Last Name" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')

const API_BASE = process.env.VUE_APP_API_BASE || 'https://into-the-land-backend.onrender.com/api'

async function register() {
  try {
    const response = await api.post(`${API_BASE}api/auth/register`, {

    })
    alert('Registration successful! Please login.')
    console.log(response.data)
  } catch (error) {
    alert(error.response?.data?.message || 'Registration failed')
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 5rem auto;
  display: flex;
  flex-direction: column;
}
input, button {
  margin-top: 1rem;
  padding: 0.7rem;
  width: 100%;
}
</style>
