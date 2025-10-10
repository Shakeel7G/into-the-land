import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Trails from '@/views/Trails.vue'
import TrailDetails from '@/views/TrailDetails.vue'
import BookTrail from '@/views/BookTrail.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import About from '@/views/About.vue'
import Pay from '@/views/Pay.vue'
import FakeApplePay from '@/views/FakeApplePay.vue'
import PayReturn from '@/views/PayReturn.vue'
import ContactUs from '@/views/ContactUs.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import TermsAndConditions from '@/views/TermsAndConditions.vue'
import ResetPassword from '@/views/ResetPassword.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/trails', name: 'Trails', component: Trails },
  { path: '/trail/:id', name: 'TrailDetails', component: TrailDetails, props: true },
  { path: '/book', name: 'BookTrail', component: BookTrail, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/register', name: 'Register', component: Register },
  { path: '/about', name: 'About', component: About },
  { path: '/pay', name: 'Pay', component: Pay },
  { path: '/privacy', name: 'PrivacyPolicy', component: PrivacyPolicy },
  { path: '/terms', name: 'TermsAndConditions', component: TermsAndConditions },
  { path: '/contact', name: 'ContactUs', component: ContactUs },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/fake-apple-pay', name: 'FakeApplePay', component: FakeApplePay },
  { path: '/pay/return', name: 'PayReturn', component: PayReturn }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/profile') // redirect to login/profile page
  } else {
    next()
  }
})

export default router
