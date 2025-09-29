<template>
  <nav class="navbar">
    <div class="logo-container">
      <img
        src="@/assets/ChatGPT_Image_Aug_5__2025__01_54_40_PM-removebg-preview.png"
        alt="Into The Land Logo"
        class="logo-image"
      />
      <span class="logo-text">Into The Land</span>
    </div>
    <ul class="nav-links">
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/trails">Trails</router-link></li>
      <li><router-link to="/about">About</router-link></li>
      <li><router-link to="/book">Book</router-link></li>
      <li><router-link to="/profile">Profile</router-link></li>
      <!-- <li v-if="isLoggedIn">
        <a href="#" @click.prevent="logout">Logout</a>
      </li> -->
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(() => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
})

function logout() {
  localStorage.removeItem('isLoggedIn')
  isLoggedIn.value = false
  router.push('/profile')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2e2e2e;
  color: white;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.logo-image {
  height: 60px;
  width: 60px;
}
.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}
.nav-links {
  display: flex;
  list-style: none;
  gap: 1.5rem;
}
.nav-links li a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}
.nav-links li a:hover {
  color: #90caf9;
}
</style>
