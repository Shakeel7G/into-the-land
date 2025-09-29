<template>
  <div class="ret-wrap">
    <div class="card" v-if="status === 'success'">
      <h2>Payment Successful</h2>
      <p>Order <strong>{{ orderId }}</strong> has been paid.</p>
      <ul class="details">
        <li><strong>Txn:</strong> {{ txnId }}</li>
        <li><strong>Amount:</strong> {{ currency }} {{ amount }}</li>
      </ul>
      <div class="actions">
        <router-link class="btn primary" to="/profile">Go to Profile</router-link>
        <router-link class="btn" to="/trails">Book Another Trail</router-link>
      </div>
    </div>

    <div class="card" v-else>
      <h2>Payment Cancelled</h2>
      <p>No charge was made for order <strong>{{ orderId }}</strong>.</p>
      <div class="actions">
        <router-link class="btn" to="/pay">Back to Payment</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const status = String(route.query.status || '')
const orderId = String(route.query.orderId || 'N/A')
const txnId = String(route.query.txnId || '')
const currency = String(route.query.currency || 'ZAR')
const amount = String(route.query.amount || '0.00')

onMounted(() => {
  if (status === 'success') {
    const pending =
      JSON.parse(localStorage.getItem('pendingPayment') || 'null') ||
      JSON.parse(localStorage.getItem('pending') || 'null')

    if (pending) {
      pending.paid = true
      pending.orderId = orderId
      pending.txnId = txnId
      pending.amount = amount
      pending.currency = currency

      const booked = JSON.parse(localStorage.getItem('bookedTrails') || '[]')
      booked.push(pending)
      localStorage.setItem('bookedTrails', JSON.stringify(booked))

      localStorage.removeItem('pendingPayment')
      localStorage.removeItem('pending')

      const upcoming = JSON.parse(localStorage.getItem('upcomingBookings') || '[]')
      upcoming.push(pending)
      localStorage.setItem('upcomingBookings', JSON.stringify(upcoming))
    }
  }
})
</script>

<style scoped>
.ret-wrap { max-width: 560px; margin: 3rem auto; padding: 0 1rem; }
.card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; box-shadow: 0 8px 24px rgba(0,0,0,.04); }
.details { list-style: none; padding: 0; margin: .75rem 0 1rem; }
.details li { margin: .25rem 0; }
.actions { display: flex; gap: .75rem; margin-top: .5rem; }
.btn { padding: .75rem 1rem; border-radius: 8px; background: #f3f4f6; text-decoration: none; }
.btn.primary { background: #16a34a; color: white; }
</style>
