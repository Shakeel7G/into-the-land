<template>
  <div class="pay-page">
    <h2>Complete Your Payment</h2>

    <div v-if="!booking">
      <p>Loading booking...</p>
    </div>

    <div v-else class="booking-summary">
      <h3>{{ booking.trail }}</h3>
      <p>Date: {{ booking.hike_date }}</p>
      <p>Time: {{ booking.hike_time || '09:00' }}</p>
      <p>Adults: {{ booking.adults }}</p>
      <p>Kids: {{ booking.kids }}</p>
      <p>Hike & Bite: {{ booking.hike_and_bite }}</p>
      <p>Photography: {{ booking.photography_option || 'None' }}</p>
      <hr />
      <p><strong>Total: R{{ booking.total_price }}</strong></p>
    </div>

    <div v-if="booking" class="payment-form">
      <label>Payment Method
        <select v-model="paymentMethod">
          <option disabled value="">Select method</option>
          <option value="card">Card</option>
          <option value="eft">EFT</option>
          <option value="cash">Cash</option>
        </select>
      </label>

      <button @click="makePayment" :disabled="isSubmitting">
        {{ isSubmitting ? "Processing..." : "Pay Now" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const booking = ref(null);
const paymentMethod = ref("");
const isSubmitting = ref(false);

const pendingBooking = JSON.parse(localStorage.getItem("pendingPayment") || "{}");

const API_BASE = process.env.VUE_APP_API_BASE || "https://into-the-land-backend.onrender.com/api";

async function fetchBooking() {
  if (!pendingBooking?.booking_id) {
    Swal.fire("Error", "No booking found for payment", "error");
    router.push("/book");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/bookings/${pendingBooking.booking_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    booking.value = res.data;
  } catch (err) {
    console.error("Error fetching booking:", err);
    Swal.fire("Error", "Failed to fetch booking", "error");
    router.push("/book");
  }
}

async function makePayment() {
  if (!paymentMethod.value) {
    Swal.fire("Error", "Please select a payment method", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE}/payments`,
      {
        booking_id: booking.value.id,
        payment_method: paymentMethod.value,
        amount: booking.value.total_price,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Swal.fire("Success", "Payment completed successfully!", "success");
    localStorage.removeItem("pendingPayment");
    router.push("/my-bookings");
  } catch (err) {
    console.error("Payment error:", err);
    Swal.fire("Error", err.response?.data?.message || "Payment failed", "error");
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(fetchBooking);
</script>

<style scoped>
.pay-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

.booking-summary p {
  margin: 0.5rem 0;
}

.payment-form {
  margin-top: 1.5rem;
}

select, button {
  width: 100%;
  padding: 0.8rem 1rem;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

button {
  background-color: #16a34a;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}

button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}
</style>
