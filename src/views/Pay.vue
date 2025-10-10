<template>
  <div class="pay-page">
    <div class="card">
      <h2 class="title">Payment</h2>

      <div v-if="!booking">
        <p>No pending booking found. Please go back and book a trail first.</p>
        <button class="btn btn-primary" @click="$router.push('/book-trail')">Book Now</button>
      </div>

      <div v-else>
        <p><strong>Trail:</strong> {{ booking.trail }}</p>
        <p><strong>Area:</strong> {{ booking.area }}</p>
        <p><strong>Date:</strong> {{ booking.date }}</p>
        <p><strong>Time:</strong> {{ booking.time }}</p>
        <p><strong>Adults:</strong> {{ booking.adults }}</p>
        <p><strong>Kids:</strong> {{ booking.kids }}</p>
        <p v-if="booking.hikeAndBite">Hike & Bite: {{ booking.hikeAndBite }}</p>
        <p v-if="booking.photography">Photography: {{ booking.photography }}</p>
        <hr />
        <p><strong>Total:</strong> R{{ booking.totalCost }}</p>

        <button class="btn btn-primary" @click="mockPay" :disabled="isPaying">
          {{ isPaying ? 'Processing Payment...' : 'Pay Now' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const router = useRouter();
const booking = ref(null);
const isPaying = ref(false);

onMounted(() => {
  const pending = localStorage.getItem("pendingPayment");
  if (pending) booking.value = JSON.parse(pending);
});

async function mockPay() {
  if (!booking.value) return;

  isPaying.value = true;
  try {
    const token = localStorage.getItem("token");
    const API_BASE = process.env.VUE_APP_API_BASE || "https://into-the-land-backend.onrender.com/api";

    // Update booking status to 'paid'
    await axios.put(`${API_BASE}/bookings/${booking.value.booking_id}/status`, 
      { status: 'paid' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Swal.fire("Success", "Payment successful! Your booking is confirmed.", "success");
    localStorage.removeItem("pendingPayment");
    router.push("/my-bookings");
  } catch (err) {
    console.error("Payment error:", err);
    Swal.fire("Error", "Payment failed. Please try again.", "error");
  } finally {
    isPaying.value = false;
  }
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem 3rem;
  background: #f9fafb;
}

.card {
  width: min(600px, 95vw);
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}

.title { margin-bottom: 1rem; font-size: 1.5rem; color: #0f172a; }

p { margin: .5rem 0; color: #334155; }

.btn {
  display: inline-block; padding:.9rem 1.1rem; border-radius:10px; border:1px solid transparent; font-weight:800;
  background:#16a34a; color:#fff; margin-top:1rem; cursor: pointer; width: 100%; text-align: center;
  transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
}
.btn:hover { background:#15803d; transform: translateY(-1px); }
.btn:disabled { background:#94a3b8; cursor: not-allowed; transform: none; }
</style>
