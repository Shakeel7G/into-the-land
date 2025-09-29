<template>
  <div class="about-page">
    <!-- Scroll Progress Bar -->
    <div class="scroll-progress">
      <div class="scroll-progress__bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <!-- Page Title -->
    <h1 class="title fade-in">Meet Your Guides</h1>

    <!-- Guides Section -->
    <div class="guides-list">
      <div
        v-for="(guide, index) in guides"
        :key="guide.name"
        class="guide-card scroll-reveal"
        :style="{ transitionDelay: index * 0.15 + 's' }"
        @click="openModal(guide)"
      >
        <img v-if="guide.photo" :src="guide.photo" class="guide-photo" />
        <h3 class="guide-name">{{ guide.name }}</h3>
        <p>{{ guide.role }}</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">&times;</button>
        <img v-if="selectedGuide.photo" :src="selectedGuide.photo" class="guide-photo" />
        <h2>{{ selectedGuide.name }}</h2>
        <p class="role">{{ selectedGuide.role }}</p>
        <p class="bio">{{ selectedGuide.bio }}</p>
        <p class="specialty">Specialty: {{ selectedGuide.specialty }}</p>
        <p class="contact">
          Email: <a :href="'mailto:' + selectedGuide.email">{{ selectedGuide.email }}</a>
        </p>
        <div class="social-icons">
          <a
            v-if="selectedGuide.instagram"
            :href="selectedGuide.instagram"
            target="_blank"
            class="social-btn instagram"
            >Instagram</a
          >
          <a
            v-if="selectedGuide.linkedin"
            :href="selectedGuide.linkedin"
            target="_blank"
            class="social-btn linkedin"
            >LinkedIn</a
          >
        </div>
      </div>
    </div>

    <!-- Stats -->
    <section class="stats scroll-reveal">
      <div class="stat">
        <div class="count" data-target="50">0</div>
        <p>Trails Explored</p>
      </div>
      <div class="stat">
        <div class="count" data-target="1000">0</div>
        <p>Happy Hikers</p>
      </div>
      <div class="stat">
        <div class="count" data-target="10">0</div>
        <p>Years Guiding</p>
      </div>
    </section>

    <!-- Trails Gallery -->
    <h2 class="gallery-title fade-in">Life on the Trails</h2>
    <div class="gallery">
      <div
        v-for="(photo, i) in trailPhotos"
        :key="i"
        class="gallery-wrapper scroll-reveal"
        :data-speed="speeds[i]"
        :style="{ transitionDelay: i * 0.1 + 's' }"
      >
        <img
          :src="photo"
          class="gallery-img"
          @click="openLightbox(i)"
          :alt="'Trail photo ' + (i + 1)"
        />
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxOpen" class="lightbox" @click="lightboxOpen = false">
      <img :src="trailPhotos[currentPhoto]" />
    </div>
  </div>
</template>

<script>
import trail1 from '@/assets/images/trail1.jpg';
import trail2 from '@/assets/images/trail2.jpg';
import trail3 from '@/assets/images/trail3.jpg';
import trail4 from '@/assets/images/trail4.jpg';
import trail5 from '@/assets/images/trail5.jpg';

export default {
  name: 'About',
  data() {
    return {
      guides: [
        {
          name: 'Imaad Peters',
          role: 'Lead Guide',
          bio: 'Experienced in coastal and forest hikes.',
          specialty: 'Navigation & Safety',
          email: 'imaad@example.com',
          instagram: 'https://instagram.com/imaad',
          linkedin: 'https://linkedin.com/in/imaad',
          photo: trail1,
        },
        {
          name: 'Asiyolise Dywili',
          role: 'Mountain Specialist',
          bio: 'Loves challenging mountain trails.',
          specialty: 'Mountain Trails',
          email: 'asiyolise@example.com',
          instagram: 'https://instagram.com/asiyolise',
          linkedin: 'https://linkedin.com/in/asiyolise',
          photo: trail2,
        },
        {
          name: 'Avelile Mnyazana',
          role: 'Trail Navigator',
          bio: 'Expert in route planning and trail maps.',
          specialty: 'Navigation',
          email: 'avelile@example.com',
          instagram: '',
          linkedin: '',
          photo: trail3,
        },
        {
          name: 'Shakeel Gafieldien',
          role: 'Wildlife Expert',
          bio: 'Passionate about local fauna and flora.',
          specialty: 'Wildlife & Plants',
          email: 'shakeel@example.com',
          instagram: 'https://instagram.com/shakeel',
          linkedin: '',
          photo: trail4,
        },
      ],
      selectedGuide: {},
      modalOpen: false,
      trailPhotos: [trail1, trail2, trail3, trail4, trail5],
      lightboxOpen: false,
      currentPhoto: 0,
      scrollProgress: 0,
      speeds: [],
    };
  },
  mounted() {
    // Scroll reveal
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('stats')) {
              this.animateCounters(entry.target.querySelectorAll('.count'));
            }
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => revealObserver.observe(el));

    // Parallax speeds
    this.speeds = this.trailPhotos.map(() => (Math.random() * 0.45 + 0.15).toFixed(2));

    // Scroll events
    this._onScroll = () => {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this.updateScrollProgress();
        this.applyParallax();
        this._raf = null;
      });
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onScroll();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this._onScroll);
    if (this._raf) cancelAnimationFrame(this._raf);
  },
  methods: {
    openModal(guide) {
      this.selectedGuide = guide;
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    openLightbox(index) {
      this.currentPhoto = index;
      this.lightboxOpen = true;
    },
    updateScrollProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      this.scrollProgress = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
    },
    applyParallax() {
      document.querySelectorAll('.gallery-wrapper.visible').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0.3');
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const centerOffset = rect.top + rect.height / 2 - viewportH / 2;
        const translateY = (centerOffset / viewportH) * 40 * speed;
        el.style.transform = `translateY(${translateY}px)`;
      });
    },
    animateCounters(nodes) {
      nodes.forEach((node) => {
        const target = parseInt(node.getAttribute('data-target'), 10) || 0;
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          node.textContent = Math.floor(eased * target).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
          else node.textContent = target.toLocaleString();
        };
        requestAnimationFrame(step);
      });
    },
  },
};
</script>

<style scoped>
.about-page {
  padding: 2rem 1rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
}

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

.title, .gallery-title {
  text-align: center;
  font-size: clamp(2rem, 3vw, 2.6rem);
  margin-bottom: 1.5rem;
}

/* Guides list */
.guides-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.guide-card {
  background: #fff;
  padding: 1.2rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  text-align: center;
  cursor: pointer;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease, box-shadow 0.25s ease;
}
.guide-card.visible { transform: translateY(0); opacity: 1; }
.guide-card:hover { box-shadow: 0 8px 18px rgba(0,0,0,0.12); }

.guide-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 0.8rem;
  display: block;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.guide-name { color: #16a34a; margin: 0.2rem 0; font-size: 1.2rem; }
.role { margin: 0.2rem 0 0.4rem; color: #555; font-weight: 500; }
.bio { font-size: 0.9rem; color: #555; margin: 0.4rem 0; }
.specialty { font-size: 0.85rem; color: #16a34a; margin-bottom: 0.6rem; }
.contact { font-size: 0.85rem; margin-bottom: 0.6rem; }
.contact a { color: #16a34a; text-decoration: none; }
.contact a:hover { text-decoration: underline; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.8rem;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.close-btn:hover {
  background: #16a34a;
  color: #fff;
}

/* Social buttons */
.social-icons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
.social-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  color: #fff;
  transition: background 0.2s ease;
}
.social-btn.instagram { background: #e4405f; }
.social-btn.instagram:hover { background: #c8234d; }
.social-btn.linkedin { background: #0077b5; }
.social-btn.linkedin:hover { background: #005983; }

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 1rem;
  margin: 0 auto 2.5rem;
  max-width: 700px;
  padding: 1rem;
  background: linear-gradient(180deg, #f8fafc, #ffffff);
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  opacity: 0;
  transform: translateY(18px);
  transition: transform 0.6s ease, opacity 0.6s ease;
}
.stats.visible { opacity: 1; transform: translateY(0); }
.stat { text-align: center; }
.count { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 800; color: #16a34a; line-height: 1; margin-bottom: 0.25rem; }
.stat p { margin: 0; color: #64748b; font-weight: 500; }

/* Gallery */
.gallery-title { text-align: center; font-size: 1.8rem; margin: 2rem 0 1.2rem; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.9rem; }
.gallery-wrapper { transform: scale(0.98) translateY(22px); opacity: 0; transition: transform 0.6s ease, opacity 0.6s ease; will-change: transform; }
.gallery-wrapper.visible { transform: translateY(0); opacity: 1; }
.gallery-img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease; }
.gallery-img:hover { transform: scale(1.03); box-shadow: 0 10px 24px rgba(0,0,0,0.15); }

/* Lightbox */
.lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.lightbox img { max-width: 90%; max-height: 90%; border-radius: 12px; }

/* Responsive */
@media (max-width: 640px) {
  .stats { grid-template-columns: 1fr 1fr 1fr; }
  .gallery-img { height: 160px; }
}
</style>
