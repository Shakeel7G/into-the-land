<template>
 <div class="hike-container">
   <div class="hike-card">
    <img :src="fullImageUrl" alt="Hike Image" class="hike-image" />
    <div class="hike-info">
      <h3>{{ hike.title }}</h3>
      <p>{{ hike.description }}</p>
      <router-link :to="`/trail/${hike.id}`" class="details-link">View Details</router-link>
    </div>
  </div>
 </div>
</template>

<script setup>
defineProps({
  hike: Object
})

// Backend URL
const BACKEND_URL = 'https://into-the-land-backend.onrender.com'

// Compute full image URL
const fullImageUrl = computed(() => {
  if (!hike.image) return ''         // fallback if no image
  if (hike.image.startsWith('http')) return hike.image // already absolute
  return `${BACKEND_URL}${hike.image}` // prepend backend URL
})
</script>

<style scoped>
.hike-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.hike-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.hike-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
.hike-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.hike-info {
  padding: 1rem;
}
.details-link {
  color: #2E7D32;
  text-decoration: none;
  font-weight: bold;
}
</style>
