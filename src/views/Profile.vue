<template>
  <div class="profile-page" ref="rootEl">
    <div class="scroll-progress">
      <div class="scroll-progress__bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <!-- Login/Register Form -->
    <div class="card scroll-reveal" v-if="!isLoggedIn">
      <form @submit.prevent="isRegistering ? register() : login()" class="form">
        <div class="form-container">
          <h2 class="title">{{ isRegistering ? 'Register' : 'Login' }}</h2>
          
          <!-- Role Selection for Registration -->
          <div v-if="isRegistering" class="role-selection scroll-reveal">
            <label>Account Type</label>
            <div class="role-options">
              <label class="radio-option">
                <input type="radio" v-model="role" value="customer" required />
                <span class="radio-label">
                  <strong>Customer</strong>
                  <small>Book and manage your trail adventures</small>
                </span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="role" value="admin" required />
                <span class="radio-label">
                  <strong>Admin</strong>
                  <small>Manage bookings and trail operations</small>
                </span>
              </label>
            </div>
          </div>

          <div class="row" v-if="isRegistering">
            <label class="mini">First Name
              <input v-model="name" type="text" placeholder="First Name" required />
            </label>
            <label class="mini">Last Name
              <input v-model="surname" type="text" placeholder="Last Name" required />
            </label>
          </div>

          <label>Email
            <input v-model="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>Password
            <input v-model="password" type="password" placeholder="••••••••" required />
          </label>

          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Login') }}
          </button>
        </div>

        <p class="switch-form">
          <a href="#" @click.prevent="toggleForm" class="link">
            {{ isRegistering ? 'Already have an account? Login' : "Don't have an account? Register" }}
          </a>
        </p>
      </form>
    </div>

    <!-- Profile Dashboard -->
    <div class="card scroll-reveal" v-else>
      <div class="profile-header">
        <div class="profile-pic-wrapper">
          <img :src="profilePic" alt="Profile Picture" class="profile-pic" />
          <!-- <label class="edit-icon" title="Change photo">
            <input type="file" @change="uploadPicture" accept="image/*" hidden />
            ✎
          </label> -->
        </div>
        <div class="profile-meta">
          <h2 class="welcome">Welcome, {{ userName || 'Explorer' }}</h2>
          <!-- <p class="muted">{{ email }}</p> -->
          <p class="role-badge" :class="userRole">{{ userRole === 'admin' ? 'Administrator' : 'Customer' }}</p>
        </div>
      </div>

      <!-- Admin View -->
      <div v-if="userRole === 'admin'">
        <!-- Paid Bookings -->
        <div class="panel scroll-reveal">
          <div class="panel-head">
            <h3>Paid Bookings</h3>
            <span class="count-badge">{{ paidBookings.length }}</span>
          </div>
          <ul class="list">
            <li v-if="paidBookings.length === 0" class="muted">No paid bookings yet.</li>
            <li v-for="booking in paidBookings" :key="booking.id" class="list-item">
              <div>
                <strong>{{ booking.trail }}</strong>
                <div class="muted small">{{ formatDate(booking.hike_date) }} • {{ booking.hike_time }}</div>
                <div class="muted small">{{ booking.name }} {{ booking.surname }} ({{ booking.email }})</div>
              </div>
              <div class="booking-details">
                <span class="chip chip-success">Paid</span>
                <div class="muted small">R{{ booking.total_price }}</div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Pending Bookings -->
        <div class="panel scroll-reveal">
          <div class="panel-head">
            <h3>Unpaid Bookings</h3>
            <span class="count-badge warning">{{ pendingBookings.length }}</span>
          </div>
          <ul class="list">
            <li v-if="pendingBookings.length === 0" class="muted">No pending bookings.</li>
            <li v-for="booking in pendingBookings" :key="booking.id" class="list-item">
              <div>
                <strong>{{ booking.trail }}</strong>
                <div class="muted small">{{ formatDate(booking.hike_date) }} • {{ booking.hike_time }}</div>
                <div class="muted small">{{ booking.name }} {{ booking.surname }} ({{ booking.email }})</div>
              </div>
              <div class="booking-details">
                <span class="chip chip-warning">Pending</span>
                <div class="muted small">R{{ booking.total_price }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Customer View -->
      <div v-else>
        <!-- Upcoming Bookings -->
        <div class="panel scroll-reveal">
          <div class="panel-head">
            <h3>My Upcoming Bookings</h3>
            <span class="count-badge">{{ upcomingBookings.length }}</span>
          </div>
          <ul class="list">
            <li v-if="upcomingBookings.length === 0" class="muted">No upcoming bookings yet.</li>
            <li v-for="booking in upcomingBookings" :key="booking.id" class="list-item">
              <div>
                <strong>{{ booking.trail }}</strong>
                <div class="muted small">{{ formatDate(booking.hike_date) }} • {{ booking.hike_time }}</div>
                <div class="muted small">Adults: {{ booking.adults }}{{ booking.kids ? `, Kids: ${booking.kids}` : '' }}</div>
                <div class="muted small" v-if="booking.hike_and_bite > 0">Hike & Bite: {{ booking.hike_and_bite }} person(s)</div>
                <div class="muted small" v-if="booking.photography_option">Photography: {{ getPhotographyText(booking.photography_option) }}</div>
              </div>
              <div class="booking-status">
                <span class="chip" :class="booking.status === 'paid' ? 'chip-success' : 'chip-warning'">
                  {{ booking.status === 'paid' ? 'Paid' : 'Pending Payment' }}
                </span>
                <div class="muted small">R{{ booking.total_price }}</div>
                <button 
                  v-if="booking.status === 'pending'" 
                  class="pay-button"
                  @click="payForBooking(booking)"
                >
                  Pay Now
                </button>
                <button 
                  v-if="booking.status === 'pending'" 
                  class="cancel-button"
                  @click="cancelBooking(booking)"
                >
                  Cancel
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Past Bookings -->
        <div class="panel scroll-reveal">
          <div class="panel-head">
            <h3>Past Bookings</h3>
            <span class="count-badge">{{ pastBookings.length }}</span>
          </div>
          <ul class="list">
            <li v-if="pastBookings.length === 0" class="muted">No past bookings yet.</li>
            <li v-for="booking in pastBookings" :key="booking.id" class="list-item">
              <div>
                <strong>{{ booking.trail }}</strong>
                <div class="muted small">{{ formatDate(booking.hike_date) }} • {{ booking.hike_time }}</div>
              </div>
              <div class="booking-details">
                <span class="chip chip-success">Completed</span>
                <div class="muted small">R{{ booking.total_price }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button v-if="userRole === 'customer'" class="btn btn-ghost" @click="$router.push('/book')">Book New Trail</button>
        <button class="btn btn-danger" @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const router = useRouter()

// Form data
const email = ref('')
const password = ref('')
const name = ref('')
const surname = ref('')
const role = ref('customer')
const isRegistering = ref(false)
const isSubmitting = ref(false)

// User state
const isLoggedIn = ref(false)
const userName = ref('')
const userEmail = ref('')
const userRole = ref('customer')
const profilePic = ref((process.env.VUE_APP_BACKEND_URL || 'https://into-the-land-backend.onrender.com') + '/images/profilePic.png')

// Booking data
const allBookings = ref([])

// Computed properties
const upcomingBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(booking => booking.hike_date >= today)
})

const pastBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(booking => booking.hike_date < today && booking.status === 'paid')
})

const paidBookings = computed(() => {
  return allBookings.value.filter(booking => booking.status === 'paid')
})

const pendingBookings = computed(() => {
  return allBookings.value.filter(booking => booking.status === 'pending')
})

// Helper function to get photography text
const getPhotographyText = (option) => {
  if (option === '2') return '2x photos'
  if (option === '4') return '4x photos'
  return option
}

/* Scroll progress + reveal */
const rootEl = ref(null)
const scrollProgress = ref(0)
let _raf = null
let revealObserver = null

function updateScrollProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  scrollProgress.value = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0
}

const onScroll = () => {
  if (_raf) return
  _raf = requestAnimationFrame(() => {
    updateScrollProgress()
    _raf = null
  })
}

function revealInitialInView() {
  const els = rootEl.value?.querySelectorAll('.scroll-reveal') || []
  const vh = window.innerHeight || document.documentElement.clientHeight
  els.forEach(el => {
    const r = el.getBoundingClientRect()
    if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add('visible')
  })
}

onMounted(async () => {
  // Check authentication
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
    userEmail.value = localStorage.getItem('userEmail') || ''
    userName.value = localStorage.getItem('username') || 'Explorer'
    userRole.value = localStorage.getItem('userRole') || 'customer'
    profilePic.value = localStorage.getItem('profilePic') || profilePic.value
    
    await loadBookings()
  }

  await nextTick()
  setupScrollEffects()
})

async function login() {
  isSubmitting.value = true
  try {
  const API_BASE = process.env.VUE_APP_API_BASE || 'https://into-the-land-backend.onrender.com/api'
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: email.value,
      password: password.value
    })
    
    const { token, user } = response.data
    
    // Store auth data
    localStorage.setItem('token', token)
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userEmail', user.email)
    localStorage.setItem('username', user.name)
    localStorage.setItem('userRole', user.role)
    localStorage.setItem('user', JSON.stringify(user))
    
    // Update component state
    isLoggedIn.value = true
    userName.value = user.name
    userEmail.value = user.email
    userRole.value = user.role
    
    // Ensure we show the profile page and load bookings immediately
    try {
      // Navigate to profile route so the user lands on their dashboard
      router.push('/')
    } catch (e) {
      // ignore navigation errors (e.g. navigating to same route)
      console.debug('Navigation to /profile skipped or failed', e)
    }

    await loadBookings()

    Swal.fire('Success', 'Login successful!', 'success')
    
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Login failed', 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function register() {
  isSubmitting.value = true
  try {
  const API_BASE = process.env.VUE_APP_API_BASE || 'https://into-the-land-backend.onrender.com/api'
    await axios.post(`${API_BASE}/register`, {
      name: name.value,
      surname: surname.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
    
    Swal.fire('Success', 'Account created! You can now log in.', 'success')
    toggleForm()
    
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function loadBookings() {
  try {
    const token = localStorage.getItem('token')
  const API_BASE = process.env.VUE_APP_API_BASE || 'https://into-the-land-backend.onrender.com/api'
    
    let endpoint = userRole.value === 'admin' ? '/bookings' : '/bookings/my'
    
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    allBookings.value = response.data
    
  } catch (error) {
    console.error('Error loading bookings:', error)
  }
}

async function cancelBooking(booking) {
  try {
    const token = localStorage.getItem('token')
  const API_BASE = process.env.VUE_APP_API_BASE || 'https://into-the-land-backend.onrender.com/api'
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This booking will be cancelled.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    })
    
    if (result.isConfirmed) {
      await axios.patch(`${API_BASE}/bookings/${booking.id}/status`, {
        status: 'cancelled'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success')
      await loadBookings() // Reload bookings
    }
  } catch (error) {
    console.error('Cancel booking error:', error)
    Swal.fire('Error', 'Failed to cancel booking', 'error')
  }
}

function toggleForm() {
  isRegistering.value = !isRegistering.value
  // Reset form
  email.value = ''
  password.value = ''
  name.value = ''
  surname.value = ''
  role.value = 'customer'
}

function logout() {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('username')
  localStorage.removeItem('userRole')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  isLoggedIn.value = false
  email.value = ''
  password.value = ''
  name.value = ''
  userName.value = ''
  userEmail.value = ''
  userRole.value = 'customer'
  allBookings.value = []
  
  router.push('/')
}

// function uploadPicture(event) {
//   const file = event.target.files[0]
//   if (!file) return
//   const reader = new FileReader()
//   reader.onload = () => {
//     profilePic.value = reader.result
//     localStorage.setItem('profilePic', reader.result)
//   }
//   reader.readAsDataURL(file)
// }

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function payForBooking(booking) {
  // Create payment data structure
  const paymentData = {
    booking_id: booking.id,
    area: '', // You might need to get this from trails table
    trail: booking.trail,
    date: booking.hike_date,
    time: booking.hike_time,
    adults: booking.adults,
    kids: booking.kids,
    hikeAndBite: booking.hike_and_bite || 0,
    photography: booking.photography_option,
    totalCost: booking.total_price,
    status: "pending"
  }
  
  localStorage.setItem("pendingPayment", JSON.stringify(paymentData))
  router.push('/pay')
}

function setupScrollEffects() {
  revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
    { threshold: 0.12, root: null, rootMargin: '0px 0px -10% 0px' }
  )
  rootEl.value?.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el))
  revealInitialInView()

  window.addEventListener('scroll', onScroll, { passive: true })
  updateScrollProgress()
}

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (_raf) cancelAnimationFrame(_raf)
  if (revealObserver) revealObserver.disconnect()
})
</script>

<style scoped>
/* Add cancel button style */
.cancel-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.cancel-button:hover {
  background: #b91c1c;
}

.booking-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

/* Other styles remain the same */

.form-container{
  width: 100%;
  margin: 0 auto;
  max-width: 790px;
}

.profile-page {
  min-height: 100vh;
  background: #ffffff;
  display: grid;
  place-items: start center;
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
  width: min(820px, 94vw);
  background: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2.4rem;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
  margin-inline: auto;
}
.title { margin: 0 0 1rem; color:#0f172a; }

/* Role Selection */
.role-selection {
  margin: 1rem 0;
}
.role-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}
.radio-option {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.radio-option:hover {
  border-color: #16a34a;
}
.radio-option input[type="radio"]:checked + .radio-label {
  color: #16a34a;
}
.radio-option input[type="radio"]:checked {
  accent-color: #16a34a;
}
.radio-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.radio-label small {
  color: #6b7280;
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .role-options {
    flex-direction: column;
  }
}

/* Forms */
.form {
  display: flex;
  flex-direction: column;
  width: min(100%, 780px);
  margin: 0 auto;
}
label { display:block; font-weight:600; margin:.65rem 0 .35rem; color:#0f172a; }
input, select {
  width: 100% !important;
  padding:.7rem .85rem;
  border-radius:10px;
  border:1px solid #e5e7eb;
  background:#ffffff;
  color:#0f172a;
  outline:none;
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
  box-sizing: border-box;
}
input::placeholder { color:#94a3b8; }
input:focus, select:focus {
  border-color:#16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,.18);
  transform: translateY(-1px);
}

.row {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.row .mini { margin:.65rem 0 .35rem; }
@media (max-width:560px){ .row { grid-template-columns: 1fr; } }

.switch-form { margin-top: .9rem; text-align: center; }
.link { color:#16a34a; font-weight:800; text-decoration:none; }
.link:hover { text-decoration: underline; }

/* Dashboard */
.profile-header {
  display:flex; align-items:center; gap:1rem; padding-bottom: .6rem; border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}
.profile-meta .welcome { margin:0; color:#0f172a; }
.muted { color:#6b7280; }
.small { font-size:.86rem; }

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: inline-block;
}
.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}
.role-badge.customer {
  background: #dbeafe;
  color: #1e40af;
}

/* Avatar */
.profile-pic-wrapper { position: relative; width: 84px; height: 84px; }
.profile-pic {
  border-radius: 50%; width: 100%; height: 100%; object-fit: cover; border: 2px solid #e5e7eb;
}
.edit-icon {
  position: absolute; bottom: -4px; right: -4px;
  background: #16a34a; color: #fff; font-size: 14px; padding: 4px 6px;
  border-radius: 999px; cursor: pointer; border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
}
.edit-icon:hover { background:#15803d; }

/* Panels */
.panel {
  background:#f8fafc;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:1rem;
  margin-bottom:1rem;
}
.panel-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:.4rem; }
.panel h3 { margin:0; color:#0f172a; }

.count-badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
.count-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.list { list-style: none; padding: 0; margin: 0; }
.list-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:.75rem .2rem; border-bottom: 1px solid #eef2f7;
  gap: 1rem;
}
.list-item:last-child { border-bottom: none; }

.booking-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.booking-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.chip {
  border-radius: 999px; padding:.25rem .6rem; font-weight:600; font-size:.85rem; border:1px solid transparent;
}
.chip-success { background:#ecfdf5; color:#065f46; border-color:#a7f3d0; }
.chip-warning { background:#fef3c7; color:#92400e; border-color:#fde68a; }

.pay-button {
  background: #16a34a;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.pay-button:hover {
  background: #15803d;
}

/* Actions */
.actions { display:flex; gap:.6rem; margin-top: 1rem; }
.btn {
  display:inline-block; padding:.9rem 1.1rem; border-radius:10px; border:1px solid transparent; text-decoration:none; font-weight:800;
  transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
  cursor: pointer;
}
.btn-primary { background:#16a34a; color:#fff; width:100%; text-align:center; }
.btn-primary:hover { background:#15803d; transform: translateY(-1px); }
.btn-primary:disabled { background:#94a3b8; cursor: not-allowed; transform: none; }
.btn-ghost { background:#ffffff; color:#0f172a; border-color:#e5e7eb; }
.btn-ghost:hover { border-color:#cbd5e1; transform: translateY(-1px); }
.btn-danger { background:#dc2626; color:#fff; }
.btn-danger:hover { background:#b91c1c; transform: translateY(-1px); }

/* Scroll reveal */
.scroll-reveal { opacity: 0; transform: translateY(18px); transition: transform .6s ease, opacity .6s ease; }
.scroll-reveal.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 600px) {
  .list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .booking-details,
  .booking-status {
    align-items: flex-start;
    width: 100%;
  }
  .pay-button {
    align-self: flex-end;
  }
  .actions {
    flex-direction: column;
  }
}
</style>
