<template>
  <div class="payment-modal-overlay">
    <div class="payment-modal large">
      
      <!-- Secure Payment Header -->
      <div class="modal-header">
        <button class="close-btn" @click="closeModal">×</button>
        <div class="secure-payment">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#e6f9ec"/>
            <path d="M8 12l3 3 5-5" stroke="#16a34a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Secure payment</span>
        </div>
        <h2>Pay for your booking</h2>
      </div>

      <!-- Summary -->
      <div class="pay-summary">
        <div>
          <div class="pay-title">{{ booking.trail }}</div>
          <div class="pay-meta">
            <span>{{ booking.date }}</span> &middot; <span>{{ booking.time }}</span>
          </div>
          <div class="pay-meta">
            <span>Adults: {{ booking.adults }}</span>
            <span v-if="booking.kids && booking.kids > 0">, Kids: {{ booking.kids }}</span>
          </div>
          <div class="pay-meta" v-if="booking.hikeAndBite">
            Hike and Bite: {{ booking.hikeAndBite }} person(s)
          </div>
          <div class="pay-meta" v-if="booking.photography">
            Photography: {{ booking.photography }}
          </div>
        </div>
        <div class="pay-amount">
          <span>Amount to pay</span>
          <div class="amount">R{{ amount }}</div>
        </div>
      </div>

      <!-- Payment Options -->
      <div v-if="screen === 'select'" class="payment-options">
        <div 
          v-for="method in paymentMethods" 
          :key="method.value" 
          class="payment-option" 
          @click="selectPayment(method.value)"
        >
          <input 
            type="radio" 
            name="payment" 
            :id="method.value" 
            :value="method.value" 
            v-model="selectedPayment"
          >
          <label :for="method.value" class="option-label">
            <div class="option-content">
              <div class="option-text">
                <span class="option-title">{{ method.title }}</span>
                <span class="option-subtitle">{{ method.subtitle }}</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div v-if="screen === 'select'" class="modal-footer">
        <button class="apply-btn" :disabled="!selectedPayment" @click="screen = 'form'">
          Continue to Payment
        </button>
      </div>

      <!-- Mastercard Form -->
      <div v-if="screen === 'form' && selectedPayment === 'mastercard'" class="payment-form">
        <div class="modal-header">
          <button class="close-btn" @click="closeModal">×</button>
          <h2>Mastercard Payment</h2>
        </div>

        <div class="form-group">
          <label>Cardholder Name</label>
          <input
            v-model="cardDetails.name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="form-group">
          <label>Card Number</label>
          <input
            v-model="cardDetails.number"
            type="text"
            maxlength="16"
            pattern="\\d{16}"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Expiry (MM/YY)</label>
            <input
              v-model="cardDetails.expiry"
              type="text"
              maxlength="5"
              placeholder="08/27"
              required
            />
          </div>
          <div class="form-group">
            <label>CVC</label>
            <input
              v-model="cardDetails.cvc"
              type="text"
              maxlength="3"
              pattern="\\d{3}"
              placeholder="123"
              required
            />
          </div>
        </div>

        <button class="pay-now-btn" :disabled="loading" @click="validateAndPay">
          <span v-if="!loading">Pay R{{ amount }}</span>
          <span v-else class="loading-spinner"></span>
        </button>
        <button class="cancel-btn" @click="closeModal">Cancel</button>
      </div>

      <!-- Success -->
      <div v-if="screen === 'success'" class="success-message">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="32" fill="#e6f9ec"/>
            <path d="M20 34l8 8 16-16" stroke="#16a34a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="success-title">Booking Confirmed!</h2>
        <div class="booking-details">
          <div class="detail-item"><span class="detail-label">Trail:</span> <span class="detail-value">{{ booking.trail }}</span></div>
          <div class="detail-item"><span class="detail-label">Date:</span> <span class="detail-value">{{ booking.date }}</span></div>
          <div class="detail-item"><span class="detail-label">Time:</span> <span class="detail-value">{{ booking.time }}</span></div>
          <div class="detail-item"><span class="detail-label">Total Paid:</span> <span class="detail-value">R{{ amount }}</span></div>
        </div>
        <div class="action-buttons">
          <button class="action-btn profile-btn" @click="goToProfile">Go to Profile</button>
          <button class="action-btn book-again-btn" @click="bookAnother">Book Another Trail</button>
        </div>
        <p class="redirect-msg">Redirecting to your profile...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const router = useRouter();
const screen = ref("select");
const selectedPayment = ref("");
const booking = ref({});
const amount = ref(0);
const loading = ref(false);

const cardDetails = reactive({
  name: "",
  number: "",
  expiry: "",
  cvc: "",
});

const paymentMethods = [
  { value: "mastercard", title: "Mastercard", subtitle: "Pay securely with card" },
  { value: "ozow", title: "Ozow", subtitle: "Instant EFT transfer" },
  { value: "applepay", title: "Apple Pay", subtitle: "Quick mobile payment" },
];

const API_BASE = "https://into-the-land-backend.onrender.com/api";

onMounted(() => {
  const stored = localStorage.getItem("pendingPayment");
  if (stored) {
    booking.value = JSON.parse(stored);
    amount.value = booking.value.totalCost || 0;
  }
});

function validateAndPay() {
  const { name, number, expiry, cvc } = cardDetails;

  if (!name.trim()) return showError("Cardholder name is required");
  if (!/^\d{16}$/.test(number)) return showError("Card number must be 16 digits");
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return showError("Expiry must be in MM/YY format");
  if (!/^\d{3}$/.test(cvc)) return showError("CVC must be 3 digits");

  processPayment();
}

async function processPayment() {
  try {
    loading.value = true;
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const paymentData = {
      booking_id: booking.value.booking_id,
      user_id: user.id,
      amount: amount.value,
      payment_method: selectedPayment.value,
    };

    await axios.post(`${API_BASE}/payments`, paymentData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    loading.value = false;
    screen.value = "success";
    localStorage.removeItem("pendingPayment");

    setTimeout(() => goToProfile(), 3000);
  } catch (err) {
    loading.value = false;
    console.error("Payment error:", err);
    Swal.fire("Error", "Payment failed. Please try again.", "error");
  }
}

function showError(msg) {
  Swal.fire("Validation Error", msg, "warning");
}

function selectPayment(method) {
  selectedPayment.value = method;
}
function closeModal() {
  router.push("/book");
}
function goToProfile() {
  router.push("/profile");
}
function bookAnother() {
  router.push("/book");
}
</script>

<style scoped>
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.payment-modal {
  background: white;
  border-radius: 14px;
  width: 95vw;
  max-width: 480px;
  min-width: 0;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
  margin: 0 8px;
}
.payment-modal.large {
  max-width: 600px;
}
@media (max-width: 600px) {
  .payment-modal,
  .payment-modal.large {
    width: 90vw;
    max-width: 90vw;
    min-width: unset;
    padding-left: 0;
    padding-right: 0;
    border-radius: 0;
  }
  .modal-header,
  .payment-options,
  .modal-footer,
  .payment-form,
  .pay-summary {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}
.modal-header {
  position: relative;
  padding: 28px 28px 12px 28px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.close-btn {
  position: absolute;
  top: 18px;
  left: 18px;
  background: none;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { color: #000; }
.secure-payment {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #16a34a;
  margin-bottom: 8px;
  font-weight: 600;
}
.pay-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 28px 10px 28px;
  border-bottom: 1px solid #eee;
  gap: 16px;
  flex-wrap: wrap;
}
.pay-title {
  font-size: 1.18rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 2px;
}
.pay-meta {
  color: #555;
  font-size: 0.98rem;
  margin-bottom: 2px;
}
.pay-amount {
  text-align: right;
  min-width: 120px;
}
.pay-amount span {
  color: #888;
  font-size: 0.98rem;
}
.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #16a34a;
  margin-top: 2px;
}
.payment-options { padding: 24px 28px 0 28px; }
.payment-option { margin-bottom: 16px; cursor: pointer; }
.payment-option input[type="radio"] { display: none; }
.option-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.payment-option input[type="radio"]:checked + .option-label {
  border-color: #16a34a;
  background-color: #e6f9ec;
}
.option-label:hover { border-color: #ccc; }
.option-content { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
  flex: 1; 
}
.payment-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}
.option-text { 
  display: flex; 
  flex-direction: column; 
}
.option-title { 
  font-weight: 500; 
  color: #333; 
  margin-bottom: 2px; 
}
.option-subtitle {
  color: #666;
  font-size: 0.9rem;
}
.applepay-info {
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}
.applepay-logo-large {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.modal-footer { padding: 24px 28px 0 28px; border-top: none; text-align: right; }
.apply-btn, .pay-now-btn, .action-btn {
  background-color: #16a34a;
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}
.apply-btn:disabled { background: #ccc; cursor: not-allowed; }
.apply-btn:hover, .pay-now-btn:hover, .action-btn:hover { background-color: #15803d; }
.payment-form { padding: 24px 28px 0 28px; }
.form-group { margin-bottom: 18px; }
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #16a34a;
}
.form-row { display: flex; gap: 18px; }
.form-row .form-group { flex: 1; }
.cancel-btn {
  background: #eee;
  color: #333;
  margin-left: 0;
  margin-top: 10px;
  padding: 12px 0;
  width: 100%;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn:hover { background: #e2e8f0; }
.success-message { text-align: center; padding: 38px 18px 18px 18px; }
.success-icon { margin-bottom: 18px; }
.success-title { color: #16a34a; margin-bottom: 18px; }
.booking-details { margin-bottom: 28px; }
.detail-item { margin-bottom: 8px; }
.detail-label { font-weight: 600; color: #333; }
.detail-value { color: #222; }
.action-buttons { display: flex; gap: 18px; justify-content: center; }
.profile-btn { background: #16a34a; }
.book-again-btn { background: #0066cc; }
.book-again-btn:hover { background: #0052a3; }
</style>
