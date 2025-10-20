<template>
  <div class="trail-details" v-if="trail">
    <img :src="`${BACKEND_URL}${trail.image_url}`" :alt="trail.title" class="trail-image" /> <!-- Uses backend URL from env -->
    <h2>{{ trail.title }}</h2>
    <p>{{ trail.description }}</p>
  <button @click="bookNow" class="book-btn">Book Now</button>
  </div>
  <div v-else>
    <p>Loading trail details...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '../services/api.js' // Use your Axios instance


// import axios from 'axios'
const route = useRoute()
const router = useRouter()
const trailId = route.params.id
const trail = ref(null)
const BACKEND_URL = process.env.VUE_APP_BACKEND_URL || 'https://into-the-land-backend.onrender.com';
// Fetch a single trail from the backend when the component is mounted
onMounted(async () => {
  try {
    const response = await api.get(`/trails/${trailId}`)
    console.log('Trail API response:', response.data)
    trail.value = response.data
  } catch (error) {
    console.error('Error fetching trail details:', error)
  }
})

function bookNow() {
  // Save pending selection so BookTrail can prefill even if the user is redirected to login
  try {
    const pending = { id: trail.value.id, area: trail.value.area };
    localStorage.setItem('pendingTrail', JSON.stringify(pending));
  } catch (e) {
    // ignore
  }
  router.push(`/book?trail=${trail.value.id}&area=${encodeURIComponent(trail.value.area)}`);
}
</script>

<style scoped>
.trail-details {
  max-width: 600px;
  margin:  auto;
  padding: 1rem;
  background-color: #F9F9F9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
.trail-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 0.5rem;
  /* margin-bottom: 0.5rem; */
}
h2 {
  font-size: 2.5rem;
  color: #2C3E50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #E0E0E0;
  padding-bottom: 0.5rem;
}
p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.5rem;
}
.book-btn {
  display: inline-block;
  background-color: #2E7D32;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.book-btn:hover {
  background-color: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.book-btn:active {
  transform: translateY(0);
}
.trail-details + div {
  text-align: center;
  font-size: 1.2rem;
  color: #777;
  margin-top: 2rem;
}
</style>
