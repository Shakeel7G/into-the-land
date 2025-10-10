<template>
  <div class="book-trail-page" ref="rootEl">
    <!-- Scroll progress -->
    <div class="scroll-progress">
      <div class="scroll-progress__bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <!-- Login Required -->
    <div v-if="!isLoggedIn" class="card scroll-reveal">
      <h2 class="title">Login Required</h2>
      <p>You must be logged in to book a trail.</p>
      <button @click="$router.push('/profile')" class="btn btn-primary">Go to Login</button>
    </div>

    <!-- Booking Form -->
    <div v-else class="card scroll-reveal">
      <h2 class="title">Book Your Adventure</h2>

      <form @submit.prevent="createBooking" class="form">
        <!-- Area -->
        <label class="scroll-reveal">Pick Area
          <select v-model="selectedArea" @change="onAreaChange" required>
            <option disabled value="">Select an area</option>
            <option v-for="area in areas" :key="area.id" :value="area">{{ area.name }}</option>
          </select>
        </label>

        <!-- Trail -->
        <label class="scroll-reveal">Pick Trail
          <select v-model="selectedTrail" :disabled="!selectedArea" required>
            <option disabled value="">Select a trail</option>
            <option v-for="trail in availableTrails" :key="trail.id" :value="trail">{{ trail.title }}</option>
          </select>
        </label>

        <!-- People -->
        <div class="row">
          <label class="mini scroll-reveal">Adults
            <input type="number" v-model.number="adults" min="1" required />
          </label>
          <label class="mini scroll-reveal">Kids under 12 (free)
            <input type="number" v-model.number="kids" min="0" />
          </label>
        </div>

        <div class="row">
          <label class="mini scroll-reveal">Select Date
            <input type="date" v-model="date" :min="minDate" required />
          </label>
          <label class="mini scroll-reveal">Time of Hike
            <select v-model="time" required>
              <option disabled value="">Select time</option>
              <option>Sunrise</option>
              <option>Midday (1:30)</option>
              <option>Sunset</option>
            </select>
          </label>
        </div>

        <!-- Addons -->
        <div class="addon-box scroll-reveal">
          <div class="row">
            <label class="mini">
              <span class="checkbox">
                <input type="checkbox" v-model="hikeAndBiteEnabled" />
                <strong>Hike and Bite (+R70 per person)</strong>
              </span>
              <small class="muted">A light picnic add-on during the hike.</small>
            </label>

            <label class="mini" :class="{ disabled: !hikeAndBiteEnabled }">
              People taking Hike & Bite
              <input
                type="number"
                v-model.number="hikeAndBiteCount"
                :min="0"
                :max="totalPeople"
                :disabled="!hikeAndBiteEnabled"
              />
              <p class="muted">
                R70 × {{ hikeAndBiteEnabled ? hikeAndBiteCount : 0 }} =
                <strong>R{{ hikeAndBiteCost }}</strong>
              </p>
            </label>
          </div>
        </div>

        <label class="scroll-reveal">Photography Option
          <select v-model="photography">
            <option value="">None</option>
            <option value="2">2x (+R100)</option>
            <option value="4">4x (+R150)</option>
          </select>
        </label>

        <!-- Summary -->
        <div class="summary scroll-reveal">
          <h3>Final Cost</h3>
          <p>Petrol: R100 × {{ adults }} = R{{ 100 * adults }}</p>
          <p>Guide: R500 × {{ adults }} = R{{ 500 * adults }}</p>
          <p>Conservation: R150 × {{ adults }} = R{{ 150 * adults }}</p>
          <p>Adults: {{ adults }}</p>
          <p>Kids: {{ kids }}</p>
          <p v-if="hikeAndBiteEnabled && hikeAndBiteCount > 0">
            Hike and Bite: R70 × {{ hikeAndBiteCount }} = <strong>R{{ hikeAndBiteCost }}</strong>
          </p>
          <p v-if="photography === '2'">Photography: R100</p>
          <p v-if="photography === '4'">Photography: R150</p>
          <hr />
          <p><strong>Total: R{{ totalCost }}</strong></p>
        </div>

        <button type="submit" :disabled="isSubmitting" class="btn btn-primary scroll-reveal">
          {{ isSubmitting ? 'Creating Booking...' : 'Book and Pay' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const router = useRouter();
const route = useRoute();

// Auth state
const isLoggedIn = ref(false);

// Form data
const selectedArea = ref("");
const selectedTrail = ref("");
const date = ref("");
const time = ref("");
const adults = ref(1);
const kids = ref(0);
const hikeAndBiteEnabled = ref(false);
const hikeAndBiteCount = ref(0);
const photography = ref("");

// API Data
const areas = ref([]);
const availableTrails = ref([]);
const isSubmitting = ref(false);

// Min date
const minDate = computed(() => new Date().toISOString().split("T")[0]);

// Total people
const totalPeople = computed(() => adults.value + kids.value);

// Costs
const hikeAndBiteCost = computed(() => (hikeAndBiteEnabled.value ? hikeAndBiteCount.value * 70 : 0));
const photographyCost = computed(() => (photography.value === "2" ? 100 : photography.value === "4" ? 150 : 0));
const baseCostPerAdult = 100 + 500 + 150;
const totalCost = computed(() => adults.value * baseCostPerAdult + hikeAndBiteCost.value + photographyCost.value);

// Watch Hike & Bite count
watch([totalPeople, hikeAndBiteEnabled, adults], () => {
  if (!hikeAndBiteEnabled.value) hikeAndBiteCount.value = 0;
  if (hikeAndBiteCount.value > totalPeople.value) hikeAndBiteCount.value = totalPeople.value;
  if (hikeAndBiteCount.value < 0) hikeAndBiteCount.value = 0;
});

// Load areas & trails
async function loadAreasAndTrails() {
  try {
    const API_BASE = process.env.VUE_APP_API_BASE || "https://into-the-land-backend.onrender.com/api";
    const areasRes = await axios.get(`${API_BASE}/areas`);
    areas.value = areasRes.data.map(a => ({ id: a.id, name: a.name, trails: [] }));
    const trailsRes = await axios.get(`${API_BASE}/trails`);
    const trailsData = trailsRes.data;
    areas.value.forEach(area => { area.trails = trailsData.filter(t => t.area_id === area.id); });

    // Preselect from query
    const trailIdParam = route.query.trail;
    const areaParam = route.query.area;
    if (areaParam) {
      const areaObj = areas.value.find(a => a.name.toLowerCase() === decodeURIComponent(areaParam).toLowerCase());
      if (areaObj) {
        selectedArea.value = areaObj;
        availableTrails.value = areaObj.trails;
        if (trailIdParam) selectedTrail.value = areaObj.trails.find(t => t.id == trailIdParam) || "";
      }
    } else if (trailIdParam) {
      for (const areaObj of areas.value) {
        const trailObj = areaObj.trails.find(t => t.id == trailIdParam);
        if (trailObj) {
          selectedArea.value = areaObj;
          availableTrails.value = areaObj.trails;
          selectedTrail.value = trailObj;
          break;
        }
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Failed to load areas or trails", "error");
  }
}

function onAreaChange() {
  selectedTrail.value = "";
  availableTrails.value = selectedArea.value ? selectedArea.value.trails : [];
}

// Create booking
async function createBooking() {
  if (!selectedTrail.value || !date.value || !time.value) {
    Swal.fire("Error", "Please fill in all required fields", "error");
    return;
  }
  isSubmitting.value = true;
  try {
    const token = localStorage.getItem("token");
    const API_BASE = process.env.VUE_APP_API_BASE || "https://into-the-land-backend.onrender.com/api";
    const bookingData = {
      trail_id: selectedTrail.value.id,
      hike_date: date.value,
      hike_time: time.value,
      adults: adults.value,
      kids: kids.value,
      hike_and_bite: hikeAndBiteEnabled.value ? hikeAndBiteCount.value : 0,
      photography_option: photography.value || null,
      total_price: totalCost.value
    };
    const res = await axios.post(`${API_BASE}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    const bookingForPayment = {
      booking_id: res.data.booking_id,
      area: selectedArea.value.name,
      trail: selectedTrail.value.title,
      date: date.value,
      time: time.value,
      adults: adults.value,
      kids: kids.value,
      hikeAndBite: hikeAndBiteEnabled.value ? hikeAndBiteCount.value : 0,
      photography: photography.value,
      totalCost: totalCost.value,
      status: "pending"
    };

    localStorage.setItem("pendingPayment", JSON.stringify(bookingForPayment));
    router.push("/pay");
  } catch (error) {
    console.error("Booking error:", error);
    Swal.fire("Error", error.response?.data?.message || "Failed to create booking", "error");
  } finally {
    isSubmitting.value = false;
  }
}

// Scroll & reveal
const rootEl = ref(null);
const scrollProgress = ref(0);
let _raf = null;
let revealObserver = null;

function updateScrollProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
}
const onScroll = () => { if (_raf) return; _raf = requestAnimationFrame(() => { updateScrollProgress(); _raf = null; }); };

function revealInitialInView() {
  const els = rootEl.value?.querySelectorAll(".scroll-reveal") || [];
  const vh = window.innerHeight || document.documentElement.clientHeight;
  els.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add("visible"); });
}
function setupScrollEffects() {
  revealObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
    { threshold: 0.12, root: null, rootMargin: "0px 0px -10% 0px" }
  );
  rootEl.value?.querySelectorAll(".scroll-reveal").forEach(el => revealObserver.observe(el));
  revealInitialInView();
  window.addEventListener("scroll", onScroll, { passive: true });
  updateScrollProgress();
}

onMounted(async () => {
  const token = localStorage.getItem("token");
  isLoggedIn.value = !!token;
  if (isLoggedIn.value) {
    await loadAreasAndTrails();
    await nextTick();
    setupScrollEffects();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (_raf) cancelAnimationFrame(_raf);
  if (revealObserver) revealObserver.disconnect();
});
</script>

<style scoped>

.book-trail-page {
  min-height: 100vh;
  background: #ffffff;
  display: grid;
  place-items: center;
  padding: 2rem 1rem 3rem;
  position: relative;
}

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

.card {
  width: min(760px, 94vw);
  background: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem 1.25rem 1.5rem;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}

.title { margin: 0 0 .9rem; color:#0f172a; }

.form { display: flex; flex-direction: column; }
label { display:block; font-weight:600; margin:.65rem 0 .35rem; color:#0f172a; }
input, select {
  width:100%;
  padding:.7rem .85rem;
  border-radius:10px;
  border:1px solid #e5e7eb;
  background:#ffffff;
  color:#0f172a;
  outline:none;
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
  box-sizing: border-box;
  max-width: 100%;
}
input::placeholder { color:#94a3b8; }
input:focus, select:focus {
  border-color:#16a34a;
  box-shadow: 0 0 0 2px rgba(22,163,74,.15);
  transform: translateY(-1px);
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  user-select: none;
}
.checkbox input { width:auto; transform: translateY(1px); }

.muted { color:#6b7280; }
.disabled { opacity:.6; pointer-events:none; }

.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}
.row > * { min-width: 0; }
.mini { display: flex; flex-direction: column; gap: .35rem; }

@media (max-width: 680px) {
  .row { grid-template-columns: 1fr; }
}

.addon-box {
  background:#f8fafc;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding: .75rem .9rem;
  margin: .6rem 0 .2rem;
}

.summary {
  background:#f8fafc;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:1rem;
  margin-top:1rem;
}
.summary h3 { margin: 0 0 .35rem; color:#0f172a; }
.summary p { margin:.25rem 0; color:#334155; }

.btn {
  display:inline-block; padding:.9rem 1.1rem; border-radius:10px; border:1px solid transparent; text-decoration:none; font-weight:800;
  background:#16a34a; color:#fff; margin-top:1rem;
  transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
  width: 100%;
  text-align: center;
  cursor: pointer;
}
.btn:hover { background:#15803d; transform: translateY(-1px); }
.btn:disabled { background:#94a3b8; cursor: not-allowed; transform: none; }

.scroll-reveal { opacity: 0; transform: translateY(18px); transition: transform .6s ease, opacity .6s ease; }
.scroll-reveal.visible { opacity: 1; transform: translateY(0); }
</style>
