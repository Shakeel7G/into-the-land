<template>
  <div class="home" ref="rootEl">
    <!-- Scroll progress -->
    <div class="scroll-progress">
      <div class="scroll-progress__bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <!-- HERO SECTION -->
    <section class="hero" id="top">
      <video class="hero-video" autoplay muted loop playsinline preload="auto">
        <source src="../assets/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div class="hero-overlay"></div>

      <div class="hero-center container scroll-reveal">
        <h1>Explore With Confidence</h1>
        <p>Accurate maps, real-time guidance, and curated trails across South Africa.</p>
        <div class="hero-ctas">
          <router-link to="/trails" class="btn btn-primary">Explore Trails</router-link>
          <router-link to="/about" class="btn btn-ghost">Learn More</router-link>
        </div>
      </div>

      <a href="#gallery" class="scroll-cue" aria-label="Scroll to next section">
        <span class="chevron"></span>
      </a>
    </section>


    <!-- SCROLL GALLERY -->
    <section id="gallery" class="section">
      <div class="container scroll-reveal">
        <div v-if="isLoading" class="loading-placeholder">
          Loading trail highlights...
        </div>
        <ScrollScenes v-else :images="homeData.scrollImages" :captions="homeData.scrollCaptions" />
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" id="features">
      <div class="container">
        <div class="section-head">
          <h2 class="scroll-reveal">Why hike with us</h2>
          <p class="muted scroll-reveal">Reliable data, safety-first design, and simple tools that work offline.</p>
        </div>

        <div class="features">
          <article class="feature scroll-reveal" v-for="feature in homeData.features" :key="feature.title">
            <img :src="feature.icon_path" :alt="feature.title" class="feature-icon" v-if="feature.icon_path" />
            <svg v-else class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <circle cx="12" cy="12" r="2.5"></circle>
            </svg>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats">
      <div class="container stats-grid">
        <div class="stat scroll-reveal" v-for="stat in homeData.stats" :key="stat.label">
          <div class="num">{{ stat.value }}</div>
          <div class="label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- REGIONS / CARDS -->
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="scroll-reveal">Trail Libraries by Region</h2>
          <router-link to="/trails" class="link scroll-reveal">Browse all</router-link>
        </div>

        <div class="cards">
          <article class="card scroll-reveal" v-for="(imgUrl, index) in homeData.scrollImages.slice(0, 3)" :key="index">
            <img :src="imgUrl" :alt="homeData.scrollCaptions[index]?.title || 'Hike image'" class="card-image" />
            <div class="card-body">
              <div>
                <h3>{{ homeData.scrollCaptions[index]?.title || 'Featured Trail' }}</h3>
                <p class="muted">{{ homeData.scrollCaptions[index]?.text || 'Explore this beautiful trail' }}</p>
              </div>
              <router-link :to="{
                path: '/trails',
                query: {
                  area: index === 1 ? 'cederberg' : formatAnchorId(homeData.scrollCaptions[index]?.title)
                }
              }" class="btn btn-sm">
                View
              </router-link>
            </div>
          </article>
        </div>
      </div>
    </section>


    <!-- CTA SECTION -->
    <section class="cta-strip">
      <div class="container cta-inner">
        <h2 class="scroll-reveal">Ready to plan your next hike?</h2>
        <router-link to="/trails" class="btn btn-primary scroll-reveal">Start Exploring</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import ScrollScenes from "@/components/ScrollScenes.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
const rootEl = ref(null);
const scrollProgress = ref(0);
const isLoading = ref(true);
const homeData = ref({
  scrollImages: [],
  scrollCaptions: [],
  features: [],
  stats: []
});

const formatAnchorId = (title) => {
  if (!title) return '';
  return title.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

let _raf = null;
let revealObserver = null;

const getAreaFromTitle = (title) => {
  if (!title) return 'all';
  return encodeURIComponent(title.split(' ')[0]);
};

const fetchHomeData = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get('/api/trails');
    homeData.value = response.data;
  } catch (error) {
    console.error("Error fetching home data:", error);
    homeData.value = {
      scrollImages: [
        (process.env.VUE_APP_BACKEND_URL || 'http://localhost:4000') + '/images/table-mountain.jpg',
        (process.env.VUE_APP_BACKEND_URL || 'http://localhost:4000') + '/images/drakensberg.jpg',
        (process.env.VUE_APP_BACKEND_URL || 'http://localhost:4000') + '/images/cederberg.jpg'
      ],
      scrollCaptions: [
        { title: 'Table Mountain', text: 'Iconic routes and skyline views over Cape Town...' },
        { title: 'Cederberg Wilderness', text: 'Sandstone arches, hidden pools, and orange sunsets...' },
        { title: 'Drakensberg', text: 'Basalt peaks, green valleys, and epic passes...' }
      ],
      features: [
        { title: 'Accurate Trails', description: 'Hand-curated routes with distances and elevation' },
        { title: 'Live Position', description: 'See your exact location on the trail' },
        { title: 'Offline Ready', description: 'Download areas and hike anywhere' },
        { title: 'Emergency Info', description: 'Local contacts when it matters most' }
      ],
      stats: [
        { value: '6000+ km', label: 'Trails mapped' },
        { value: '50+', label: 'Areas covered' },
        { value: 'Nationwide', label: 'Coverage' }
      ]
    };
  } finally {
    isLoading.value = false;
  }
};

const updateScrollProgress = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
};

const onScroll = () => {
  if (_raf) return;
  _raf = requestAnimationFrame(() => {
    updateScrollProgress();
    _raf = null;
  });
};

const revealInitialInView = () => {
  const els = rootEl.value?.querySelectorAll(".scroll-reveal") || [];
  const vh = window.innerHeight || document.documentElement.clientHeight;
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add("visible");
  });
};

const initScrollEffects = () => {
  revealObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    }), {
    threshold: 0.12,
    root: null,
    rootMargin: "0px 0px -10% 0px"
  }
  );
  rootEl.value?.querySelectorAll(".scroll-reveal").forEach(el => revealObserver.observe(el));
  revealInitialInView();
  window.addEventListener("scroll", onScroll, { passive: true });
  updateScrollProgress();
};

onMounted(async () => {
  await fetchHomeData();
  initScrollEffects();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (revealObserver) revealObserver.disconnect();
});
</script>

<style scoped>
/* Base – light */
:root {
  --container: 1140px;
  --gap: 1.25rem;
}

.container {
  width: min(var(--container), 92%);
  margin-inline: auto;
}

.muted {
  color: #6b7280;
}

.home {
  background: #ffffff;
}

/* Scroll progress  */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  width: 100%;
  z-index: 100;
}

.scroll-progress__bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  transition: width .1s linear;
}

/* HERO */
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  overflow: hidden;
  border-radius: 10px;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .45);
}

.hero-center {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  top: 50%;
  transform: translateY(-50%);
}

.hero-center h1 {
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  line-height: 1.05;
  margin-bottom: .6rem;
}

.hero-center p {
  font-size: clamp(1.05rem, 2.4vw, 1.35rem);
  margin-bottom: 1.3rem;
  opacity: .98;
}

.hero-ctas {
  display: flex;
  gap: .8rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-block;
  border: 1px solid transparent;
  padding: .85rem 1.25rem;
  border-radius: 10px;
  font-weight: 800;
  text-decoration: none;
}

.btn-primary {
  background: #16a34a;
  color: #fff;
}

.btn-primary:hover {
  background: #15803d;
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  border-color: #ffffff80;
  color: #fff;
}

.btn-ghost:hover {
  border-color: #fff;
}

.btn-sm {
  padding: .55rem .9rem;
  border-radius: 9px;
  background: #16a34a;
  color: #fff;
}

.btn-sm:hover {
  background: #15803d;
}

/* Scroll cue */
.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  width: 28px;
  height: 44px;
  border: 2px solid #ffffff66;
  border-radius: 20px;
  display: grid;
  place-items: center;
}

.chevron {
  width: 8px;
  height: 8px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg);
  margin-top: 6px;
  animation: drop 1.3s infinite ease-in-out;
}

@keyframes drop {
  0% {
    transform: translateY(0) rotate(45deg);
    opacity: 1;
  }

  70% {
    transform: translateY(8px) rotate(45deg);
    opacity: .2;
  }

  100% {
    transform: translateY(0) rotate(45deg);
    opacity: 1;
  }
}

/* Sections */
.section {
  padding: clamp(2.5rem, 6vw, 4rem) 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-head h2 {
  font-size: clamp(1.4rem, 4vw, 2rem);
}

.link {
  color: #16a34a;
  text-decoration: none;
  font-weight: 800;
}

.link:hover {
  text-decoration: underline;
}

/* Features – light cards */
.features {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gap);
}

.feature {
  grid-column: span 12;
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
}

.feature h3 {
  margin: .25rem 0 .35rem;
  font-size: 1.05rem;
  color: #0f172a;
}

.feature p {
  color: #4b5563;
  font-size: .98rem;
}

@media (min-width: 768px) {
  .feature {
    grid-column: span 3;
  }
}

.feature-icon {
  width: 40px;
  height: 40px;
  color: #16a34a;
  margin-bottom: .6rem;
  flex-shrink: 0;
}

/* Stats – light band */
.stats {
  background: #f5f7f6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gap);
  align-items: center;
}

.stat {
  grid-column: span 12;
  text-align: center;
  padding: 1rem 0;
}

.num {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  color: #0f172a;
}

.label {
  color: #4b5563;
}

@media (min-width:768px) {
  .stat {
    grid-column: span 4;
  }
}

/* Cards – light */
.cards {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gap);
}

.card {
  grid-column: span 12;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .06);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card-body {
  padding: 1rem;
  display: flex;
  gap: .75rem;
  align-items: center;
  justify-content: space-between;
}

.card-body h3 {
  font-size: 1rem;
  color: #0f172a;
}

.card-body p {
  color: #6b7280;
  font-size: .9rem;
}

@media (min-width: 768px) {
  .card {
    grid-column: span 4;
  }

  .card img {
    height: 200px;
  }

  .card:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

}

.cta-strip {
  background: #0e1713;
  color: #fff;
  /* slimmer: smaller vertical padding */
  padding: clamp(0.9rem, 2.2vw, 1.2rem) 0;
  display: flex;
  align-items: center;
  border-radius: 10px;
}

.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Mobile: stack CTA content and make buttons full width */
@media (max-width: 600px) {
  .cta-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: .75rem;
    padding: 0 .75rem;
  }

  .cta-inner .btn {
    width: 100%;
    max-width: 420px;
  }
}

.cta-strip h2 {
  font-size: clamp(1.05rem, 3.2vw, 1.5rem);
  margin: 0;
  line-height: 1.1;
}

/* Scroll reveal  */
.scroll-reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: transform .6s ease, opacity .6s ease;
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Loading placeholder */
.loading-placeholder {
  height: 80vh;
  display: grid;
  place-items: center;
  color: #6b7280;
  font-size: 1.2rem;
}

/* Card image specific styles */
.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

@media (min-width: 768px) {
  .card-image {
    height: 200px;
  }
}
</style>
