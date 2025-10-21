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

    <!-- Mobile toggle -->
    <button
      class="nav-toggle"
      :class="{ open: isOpen }"
      :aria-expanded="isOpen"
      @click="toggle"
      aria-label="Toggle navigation"
    >
      <span class="bar" aria-hidden="true"></span>
      <span class="bar" aria-hidden="true"></span>
      <span class="bar" aria-hidden="true"></span>
    </button>

    <ul class="nav-links" :class="{ open: isOpen }">
      <li @click="close"><router-link to="/">Home</router-link></li>
      <li @click="close"><router-link to="/trails">Trails</router-link></li>
      <li @click="close"><router-link to="/about">About</router-link></li>
      <li @click="close"><router-link to="/book">Book</router-link></li>
      <li @click="close"><router-link to="/profile">Profile</router-link></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
const isOpen = ref(false)

onMounted(() => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
})

function logout() {
  localStorage.removeItem('isLoggedIn')
  isLoggedIn.value = false
  router.push('/profile')
}

function close() {
  // Close mobile menu when navigating
  console.log('Nav close called')
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
  console.log('Nav toggle, now open=', isOpen.value)
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
  /* Ensure the navbar creates a stacking context and anchors the dropdown */
  position: relative;
  z-index: 2400;
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

/* Mobile toggle button */
.nav-toggle {
  display: none;
  background: transparent;
  border: none;
  gap: 6px;
  padding: 6px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  height: 28px;
}
.nav-toggle .bar {
  display: inline-block;
  width: 2px;
  height: 20px;
  background: #fff;
  margin: 0 6px;
  transition: transform .22s cubic-bezier(.2,.9,.2,1), opacity .18s ease;
  border-radius: 2px;
}

.nav-toggle.open .bar:nth-child(1) {
  transform: translateX(6px) rotate(45deg);
}
.nav-toggle.open .bar:nth-child(2) {
  opacity: 0;
  transform: scaleY(0.2);
}
.nav-toggle.open .bar:nth-child(3) {
  transform: translateX(-6px) rotate(-45deg);
}

@media (max-width: 820px) {
  .nav-toggle { display: inline-flex; }
  .nav-links {
    display: none;
  }

  .nav-links.open {
    display: flex;
    position: absolute;
    top: calc(100% + 8px);
    right: 12px;
    background: linear-gradient(180deg, #333, #262626);
    flex-direction: column;
    align-items: stretch;
    width: 220px;
    padding: .5rem .5rem;
    gap: .25rem;
    border-radius: 10px;
    box-shadow: 0 10px 34px rgba(0,0,0,0.35);
    z-index: 2500;
    transform-origin: top right;
    transform: translateY(-6px) scale(.98);
    opacity: 0;
    transition: transform .18s cubic-bezier(.2,.9,.2,1), opacity .18s ease;
    backdrop-filter: blur(4px);
  }

  .nav-links.open { transform: translateY(0) scale(1); opacity: 1; }

  .nav-links li { width: 100%; }
  .nav-links li a { display: block; width: 100%; padding: .6rem .5rem; text-align: left; border-radius: 6px; }
  .nav-links li a:hover { background: rgba(255,255,255,0.03); }
}
</style>
