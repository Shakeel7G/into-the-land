<template>
  <div class="contact-page">
    <!-- Scroll progress bar -->
    <div class="scroll-progress">
      <div class="scroll-progress__bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section fade-in">
      <h1 class="title">Get in Touch</h1>
      <p class="subtitle">We’d love to hear from you! Reach out below.</p>
    </section>

    <div class="divider"></div>

    <!-- Contact Card Section -->
    <section class="contact-card scroll-reveal">
      <div class="info">
        <p>📍 <strong>Address:</strong> Cape Town, South Africa</p>
        <p>📧 <strong>Email:</strong> <a href="mailto:contact@into-the-land.com">contact@into-the-land.com</a></p>
        <p>📞 <strong>Phone/WhatsApp:</strong> <a href="tel:+27786516494">+27 78 651 6494</a></p>
        <p>📱 <strong>Social:</strong> <a href="https://www.instagram.com/intotheland_" target="_blank" rel="noopener">Instagram</a></p>
      </div>

      <!-- Contact Form -->
      <form class="contact-form" @submit.prevent="submitContactForm">
        <div class="form-group">
          <input type="text" v-model="name" placeholder=" " required />
          <label>Your Name</label>
          <span class="icon">👤</span>
        </div>
        <div class="form-group">
          <input type="email" v-model="email" placeholder=" " required />
          <label>Your Email</label>
          <span class="icon">📧</span>
        </div>
        <div class="form-group">
          <textarea rows="4" v-model="message" placeholder=" " required></textarea>
          <label>Your Message</label>
          <span class="icon">✉️</span>
        </div>
        <button type="submit" class="btn" :disabled="submitting">{{ submitting ? 'Sending...' : 'Send Message' }}</button>
      </form>
    </section>

    <div class="divider"></div>

    <!-- Footer Note Section -->
    <section class="footer-note fade-in">
      <p>We aim to respond within 24 hours. Your privacy is respected.</p>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: "ContactUs",
  data() {
    return {
      scrollProgress: 0,
      name: '',
      email: '',
      message: '',
      submitting: false
    };
  },
  methods: {
    async submitContactForm() {
      if (!this.name || !this.email || !this.message) return;
      this.submitting = true;
      try {
  const API_BASE = process.env.VUE_APP_API_BASE || 'http://localhost:4000/api';
        await axios.post(`${API_BASE}/contact`, {
          name: this.name,
          email: this.email,
          message: this.message
        });
        alert('Message sent! We will get back to you soon.');
        this.name = '';
        this.email = '';
        this.message = '';
      } catch (e) {
        // alert('Failed to send message. Please try again later.');
      } finally {
        this.submitting = false;
      }
    }
  },
  mounted() {
    this._onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      this.scrollProgress = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
    };
    window.addEventListener("scroll", this._onScroll, { passive: true });
    this._onScroll();

    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".scroll-reveal").forEach(el => revealObserver.observe(el));
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this._onScroll);
  }
};
</script>

<style scoped>
/* General Page */
.contact-page {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(to bottom, #f0fdf4, #ffffff);
  padding: 2rem 1rem 3rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Scroll Progress Bar */
.scroll-progress {
  position: sticky;
  top: 0;
  height: 4px;
  background: transparent;
  z-index: 50;
}
.scroll-progress__bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  transition: width 0.1s linear;
  border-radius: 2px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding-bottom: 2rem;
}
.title {
  font-size: clamp(2rem, 3vw, 2.4rem);
  font-weight: 800;
  margin-bottom: 0.25rem;
  color: #1e3a24;
}
.subtitle {
  color: #4b5563;
  font-size: 1.1rem;
}

/* Divider */
.divider {
  height: 2px;
  width: 60%;
  margin: 2rem auto;
  background: linear-gradient(to right, #16a34a, #22c55e);
  border-radius: 2px;
}

/* Contact Card */
.contact-card {
  background: #fff;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
}
.contact-card.visible {
  transform: translateY(0);
  opacity: 1;
}
.contact-card .info p {
  margin-bottom: 0.5rem;
  color: #374151;
}

/* Contact Form */
.contact-form {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
  
}
.form-group {
  position: relative;
}
.form-group input,
.form-group textarea {
  width: 100%;
  max-width: 100%;
  padding: 0.9rem 2.5rem 0.9rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: none;
  box-sizing: border-box;
  display: block;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22,163,74,0.15);
}

/* Floating Labels */
.form-group label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 0.25rem;
  color: #9ca3af;
  font-size: 1rem;
  pointer-events: none;
  transition: 0.3s ease all;
}
.form-group input:focus + label,
.form-group input:not(:placeholder-shown) + label,
.form-group textarea:focus + label,
.form-group textarea:not(:placeholder-shown) + label {
  top: -0.6rem;
  left: 0.9rem;
  font-size: 0.85rem;
  color: #16a34a;
}

/* Icons */
.form-group .icon {
  position: absolute;
  top: 50%;
  right: 0.9rem;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #16a34a;
  pointer-events: none;
  transition: transform 0.3s ease, color 0.3s ease;
}
.form-group input:focus ~ .icon,
.form-group textarea:focus ~ .icon {
  transform: translateY(-50%) translateX(3px);
  color: #22c55e;
}
@keyframes pulseIcon {
  0%, 100% { transform: translateY(-50%) translateX(3px) scale(1); }
  50% { transform: translateY(-50%) translateX(3px) scale(1.1); }
}
.form-group input:focus:not(:placeholder-shown) ~ .icon,
.form-group textarea:focus:not(:placeholder-shown) ~ .icon {
  animation: pulseIcon 1s ease-in-out infinite;
}

/* Button */
.btn {
  background-color: #2e7d32;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border: none;
  cursor: pointer;
}
.btn:hover {
  background-color: #1b5e20;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.btn:active { transform: translateY(0); }

/* Footer Note */
.footer-note {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.95rem;
  color: #6b7280;
}
</style>
