<template>
  <section class="scrolly">
    <!-- Sticky image stage -->
    <div class="stage">
      <transition name="fade" mode="out-in">
        <img
          :key="activeIndex"
          class="stage-img"
          :src="images[activeIndex]"
          alt=""
          loading="eager"
          decoding="async"
        />
      </transition>
      <div class="stage-gradient"></div>
    </div>

    <!-- Scroll steps -->
    <div class="steps" ref="stepsRoot">
      <article
        v-for="(cap, i) in effectiveCaptions"
        :key="i"
        class="step"
        :data-index="i"
      >
        <h3>{{ cap.title }}</h3>
        <p>{{ cap.text }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  images: { type: Array, required: true },
  captions: { type: Array, default: () => [] },
});

const activeIndex = ref(0);
const stepsRoot = ref(null);

const effectiveCaptions = computed(() =>
  props.captions.length === props.images.length
    ? props.captions
    : props.images.map((_, i) => ({
        title: `Scene ${i + 1}`,
        text: "Scroll to reveal the next scene.",
      }))
);

function preload(urls) {
  urls.forEach((u) => { const img = new Image(); img.src = u; });
}

let observer;
onMounted(() => {
  preload(props.images);

  const options = { root: null, rootMargin: "-35% 0px -35% 0px", threshold: 0.0 };
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.dataset.index);
        if (!Number.isNaN(idx)) activeIndex.value = idx;
      }
    });
  }, options);

  const steps = stepsRoot.value?.querySelectorAll(".step") || [];
  steps.forEach((el) => observer.observe(el));
});

onBeforeUnmount(() => { if (observer) observer.disconnect(); });
</script>

<style scoped>
.scrolly {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
@media (min-width: 900px) {
  .scrolly { grid-template-columns: 1fr 1fr; }
}

/* Sticky stage */
.stage {
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 560px;
  overflow: hidden;
  grid-column: 1 / -1;
}
@media (min-width: 900px) {
  .stage { grid-column: 1 / 2; }
}

.stage-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.stage-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.35));
  pointer-events: none;
}

/* Steps */
.steps { grid-column: 1 / -1; background: #f7f7f7; }
@media (min-width: 900px) { .steps { grid-column: 2 / 3; } }

.step {
  min-height: 90vh;
  display: grid;
  align-content: center;
  gap: .5rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  border-bottom: 1px solid #e5e7eb;
}
.step h3 { font-size: clamp(1.25rem, 2.6vw, 1.6rem); margin: 0; }
.step p { color: #4b5563; margin: 0; }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
