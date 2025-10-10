<template>
  <div class="pay-page">
    <div v-if="!booking" class="card">
      <h2>Loading booking...</h2>
    </div>

    <div v-else class="card">
      <h2>Complete Your Payment</h2>
      <p><strong>Trail:</strong> {{ booking.trail_title }}</p>
      <p><strong>Date:</strong> {{ booking.hike_date }}</p>
      <p><strong>Time:</strong> {{ booking.hike_time }}</p>
      <p><strong>Adults:</strong> {{ booking.adults }}</p>
      <p><strong>Kids:</strong> {{ booking.kids }}</p>
      <p v-if="booking.hike_and_bite">Hike & Bite: {{ booking.hike_and_bite }}</p>
      <p v-if="booking.photography_option">Photography: {{ booking.photography_option }}</p>
      <p><strong>Total:</strong> R{{ booking.total_price }}</p>

      <div class="payment-methods">
        <label>
          <input type="radio" value="apple_pay" v-model="paymentMethod" /> Apple Pay (Mock)
        </label>
        <label>
          <input type="radio" value="card" v-model="paymentMethod" /> Card (Mock)
        </label>
      </div>

      <button class="btn btn-primary" @click="makePayment" :disabled="isSubmitting">
        {{ isSubmitting ? "Processing..." : "Pay Now" }}
      </button>
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
const isSubmitting = ref(false);
const paymentMethod = ref("apple_pay");

const loadBooking = async () => {
  try {
    const pendingPayment = JSON.parse(localStorage.getItem("pendingPayment"));
    if (!pendingPayment) throw new Error("No pending booking found");

    const token = localStorage.getItem("token");
    const API_BASE = process.env.VUE_APP_API_BASE || "https://into-the-land-backend.onrender.com/api";
    const res = await axios.get(`${API_BASE}/bookings/${pendingPayment.booking_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    booking.value = res.data;
  } catch (error) {
    console.error("Payment page load error:", error);
    Swal.fire("Error", error.response?.data?.message || error.message || "Cannot load booking", "error");
    router.push("/book");
  }
};

const makePayment = async () => {
  if (!paymentMethod.value) {
    Swal.fire("Error", "Please select a payment method", "error");
    return;
  }

  isSubmitting.value = true;

  try {
    const token = localStorage.getItem("token");
    const API_BASE = process.env.VUE_APP_API_BASE || "https://into-the-land-backend.onrender.com/api";

    // Create a payment record
    await axios.post(`${API_BASE}/payments`, {
      booking_id: booking.value.id,
      user_id: booking.value.user_id,
      amount: booking.value.total_price,
      payment_method: paymentMethod.value,
      payment_status: "paid",
    }, { headers: { Authorization: `Bearer ${token}` } });

    // Update booking status
    await axios.put(`${API_BASE}/bookings/${booking.value.id}/status`, {
      status: "paid"
    }, { headers: { Authorization: `Bearer ${token}` } });

    Swal.fire("Success", "Payment completed!", "success");
    localStorage.removeItem("pendingPayment");
    router.push("/profile");
  } catch (error) {
    console.error("Payment error:", error);
    Swal.fire("Error", error.response?.data?.message || "Payment failed", "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadBooking);
</script>

<style scoped>
.pay-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  background: #ffffff;
}

.card {
  max-width: 600px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}

h2 { margin-bottom: 1rem; color: #0f172a; }

.payment-methods {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: inline-block;
  padding: 0.9rem 1.1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 800;
  background: #16a34a;
  color: #fff;
  width: 100%;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.btn:hover { background: #15803d; transform: translateY(-1px); }
.btn:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }
</style>
