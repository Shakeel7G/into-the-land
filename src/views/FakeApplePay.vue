<template>
  <div class="fake-wrap">
    <div class="head">
      <div class="logo">
        <!-- Apple logo -->
        <svg viewBox="0 0 30 30" width="22" height="22" aria-hidden="true">
          <path d="M20.7 16.9c0-3.2 2.6-4.7 2.7-4.8-1.5-2.3-3.8-2.6-4.6-2.6-2-0.2-4 1.2-5 1.2-1 0-2.6-1.2-4.2-1.2-2.1 0-4 1.2-5.1 3-2.2 3.8-0.6 9.4 1.6 12.5 1.1 1.6 2.4 3.4 4.1 3.3 1.6-0.1 2.2-1.1 4.1-1.1 1.9 0 2.4 1.1 4.1 1.1 1.7 0 2.8-1.6 3.9-3.2 1.3-1.9 1.8-3.7 1.8-3.7-0.1-0.1-3.3-1.3-3.3-4.5zM17.3 6.6c0.9-1.1 1.5-2.6 1.3-4.1-1.3 0.1-2.8 0.9-3.6 2-0.8 1-1.5 2.5-1.3 4 1.4 0.1 2.8-0.8 3.6-1.9z" fill="#111"/>
        </svg>
        <span>Apple Pay</span>
      </div>
      <!-- <span class="badge"> / SANDBOX</span> -->
    </div>

    <div class="card">
      <h2>Confirm with Apple Pay</h2>
   

      <div class="summary">
        <div><strong>Order ID:</strong> {{ orderId }}</div>
        <div><strong>Amount:</strong> {{ currency }} {{ amount }}</div>
      </div>

      <div class="actions">
        <button class="btn pay" :disabled="paying" @click="confirmPay">
          {{ paying ? 'Processing…' : 'Confirm' }}
        </button>
        <button class="btn cancel" :disabled="paying" @click="cancelPay">Cancel</button>
      </div>
    </div>

    
  </div>
</template>


<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const amount = route.query.amount || '0.00'
const currency = route.query.currency || 'ZAR'
const orderId = route.query.orderId || 'N/A'
const returnUrl = (route.query.returnUrl && String(route.query.returnUrl)) || (window.location.origin + '/pay/return')
const paying = ref(false)

const API = process.env.VUE_APP_BACKEND_URL || 'http://localhost:4000'

async function confirmPay() {
  try {
    paying.value = true
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please log in first')
      router.push('/login')
      return
    }

    // 1️ Create booking
    const bookingRes = await axios.post(`${API}/api/bookings`, {
      trail_id: route.query.trail_id,        // make sure you pass these in query or props
      hike_date: route.query.hike_date,
      hike_time: route.query.hike_time,
      adults: route.query.adults,
      kids: route.query.kids || 0,
      hike_and_bite: route.query.hike_and_bite || 0,
      photography_option: route.query.photography_option || '',
      total_price: amount,
      payment_method: 'applepay'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const booking_id = bookingRes.data.booking_id

    // 2️ Create payment
    const paymentRes = await axios.post(`${API}/api/payments`, {
      booking_id,
      amount,
      payment_method: 'applepay'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    console.log('Payment success:', paymentRes.data)

    // 3️ Redirect back with success
    const txnId = 'AP-' + Math.random().toString(36).slice(2, 10).toUpperCase()
    const url = new URL(returnUrl)
    url.searchParams.set('status', 'success')
    url.searchParams.set('orderId', booking_id)
    url.searchParams.set('txnId', txnId)
    url.searchParams.set('amount', String(amount))
    url.searchParams.set('currency', String(currency))
    router.push(url.pathname + url.search)

  } catch (err) {
    console.error('Payment error:', err.response?.data || err)
    alert(err.response?.data?.message || 'Payment failed. Please try again.')
  } finally {
    paying.value = false
  }
}

function cancelPay() {
  const url = new URL(returnUrl)
  url.searchParams.set('status', 'cancel')
  url.searchParams.set('orderId', String(orderId))
  router.push(url.pathname + url.search)
}
</script>



<style scoped>
.fake-wrap { max-width: 520px; margin: 3rem auto; padding: 0 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.logo { display:flex; align-items:center; gap:.5rem; font-size: 1.2rem; font-weight: 800; color:#111; }
.badge { font-size: .8rem; background: #eef2ff; color: #3730a3; padding: .25rem .5rem; border-radius: 6px; }
.card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; box-shadow: 0 8px 24px rgba(0,0,0,.04); }
.summary { background: #0f172a; color:#e2e8f0; border-radius: 8px; padding: .9rem; margin: 1rem 0; }
.actions { display: flex; gap: .75rem; }
.btn { padding: .8rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 800; }
.btn.pay { background: #111; color: white; }
.btn.cancel { background: #f3f4f6; }
.muted { color:#6b7280; font-size: .9rem; }
.foot { text-align: center; margin-top: 1rem; }
</style>

