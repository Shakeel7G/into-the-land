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
import api from "@/services/api";

export default {
  name: "Pay",
  data() {
    return {
      booking: null,
      paymentMethod: "",
      message: "",
    };
  },
  async mounted() {
    // Get booking data from route params (or local storage)
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      this.booking = JSON.parse(storedBooking);
    } else {
      this.message = "No booking found. Please book a trail first.";
    }
  },
  methods: {
    async makePayment() {
      try {
        if (!this.paymentMethod) {
          this.message = "Please select a payment method.";
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          this.message = "You must be logged in to make a payment.";
          return;
        }

        const response = await api.post(
          "/payments",
          {
            booking_id: this.booking.id,
            amount: this.booking.total_price,
            payment_method: this.paymentMethod,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.message = "✅ Payment successful!";
        console.log("Payment response:", response.data);

        // Update booking status locally
        localStorage.removeItem("currentBooking");

        // Optional: redirect to confirmation page
        this.$router.push("/confirmation");
      } catch (err) {
        console.error("Payment error:", err);
        this.message =
          err.response?.data?.message ||
          "Payment failed. Please try again later.";
      }
    },
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
