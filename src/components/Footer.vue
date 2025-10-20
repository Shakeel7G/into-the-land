<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <p>&copy; 2025 Into The Land. All rights reserved.  </p>
      </div>
      <div class="footer-right">
        <router-link to="/privacy"> Privacy Policy</router-link>
        <router-link to="/terms">Terms of Use</router-link>
        <router-link to="/contact">Contact</router-link>
        <a href="https://www.instagram.com/intotheland_" target="_blank" rel="noopener">Instagram</a>
      </div>
    </div>
  </footer>
</template>
<script setup>
</script>
<style scoped>
.footer {
  background-color: #2e2e2e;
  color: white;
  text-align: center;
  padding: 1.5rem 1rem;
  position: relative;
  bottom: 0;
  width: auto;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  font-size: 0.9rem;
  z-index: 10;
  display: flex;
  
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid #444;
  border-radius: 0 0 12px 12px;
  margin-top: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #1a1a1a, #2e2e2e);
  color: #90caf9;
  font-size: 0.9rem;
  font-weight: 300;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.footer-right {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.footer-right a {
  color: #90caf9;
  text-decoration: none;
  transition: color 0.3s;
}
.footer-right a:hover {
  color: white;
}
</style>
