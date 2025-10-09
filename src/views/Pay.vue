<template>
  <div class="payment-container">
    <h2>Complete Payment</h2>

    <div v-if="booking">
      <p><strong>Trail:</strong> {{ booking.trail_title }}</p>
      <p><strong>Total:</strong> R{{ booking.total_price }}</p>
    </div>

    <form @submit.prevent="makePayment">
      <label for="paymentMethod">Select Payment Method:</label>
      <select v-model="paymentMethod" id="paymentMethod" required>
        <option disabled value="">-- Choose Payment Method --</option>
        <option value="credit_card">Credit Card</option>
        <option value="paypal">PayPal</option>
        <option value="cash">Cash</option>
      </select>

      <button type="submit" class="pay-btn">Pay Now</button>
    </form>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { ref } from "vue";
import api from "@/services/api.js";

export default {
  name: "Pay",
  setup() {
    const bookingId = ref(null);
    const amount = ref(0);
    const paymentMethod = ref("card");
    const isLoading = ref(false);
    const message = ref("");

    // Example: receive booking data via route or props
    // Make sure your router passes booking_id and amount via route params or state
    const route = useRoute();
    bookingId.value = route.query.booking_id;
    amount.value = route.query.amount;

    // Get token
    const token = localStorage.getItem("token");

    const handlePayment = async () => {
      if (!bookingId.value || !amount.value) {
        message.value = "Missing booking or payment info.";
        return;
      }

      isLoading.value = true;
      message.value = "";

      try {
        const res = await api.post(
          "/payments",
          {
            booking_id: bookingId.value,
            amount: amount.value,
            payment_method: paymentMethod.value,
            payment_status: "completed", // default for now
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Payment success:", res.data);
        message.value = "✅ Payment processed successfully!";
      } catch (err) {
        console.error("Payment error:", err);
        message.value = "❌ Payment failed. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };

    return {
      bookingId,
      amount,
      paymentMethod,
      isLoading,
      message,
      handlePayment,
    };
  },
};
</script>

<style scoped>
.payment-container {
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.pay-btn {
  background: #28a745;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  margin-top: 15px;
  cursor: pointer;
}
.pay-btn:hover {
  background: #218838;
}
.message {
  margin-top: 15px;
  color: #333;
}
</style>
