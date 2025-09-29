<template>
  <div class="reset-password-page">
    <div class="card">
      <h2>Reset Password</h2>
      
      <div v-if="!tokenValidated">
        <p>Validating reset token...</p>
      </div>

      <div v-else-if="tokenValid">
        <form @submit.prevent="resetPassword" class="form">
          <label>New Password
            <input 
              v-model="newPassword" 
              type="password" 
              placeholder="Enter new password" 
              required 
            />
          </label>
          
          <label>Confirm Password
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="Confirm new password" 
              required 
            />
          </label>

          <button type="submit" class="btn btn-primary" :disabled="isResetting">
            {{ isResetting ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </div>

      <div v-else>
        <p class="error-message">Invalid or expired reset token.</p>
        <router-link to="/profile" class="link">Return to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const token = route.query.token
const tokenValid = ref(false)
const tokenValidated = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const isResetting = ref(false)

onMounted(async () => {
  if (!token) {
    tokenValidated.value = true
    tokenValid.value = false
    return
  }

  try {
  const API_BASE = process.env.VUE_APP_API_BASE || 'http://localhost:4000/api'
    const response = await axios.get(`${API_BASE}/verify-reset-token/${token}`)
    
    tokenValid.value = response.data.valid
  } catch (error) {
    tokenValid.value = false
  } finally {
    tokenValidated.value = true
  }
})

const resetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire('Error', 'Passwords do not match', 'error')
    return
  }

  if (newPassword.value.length < 6) {
    Swal.fire('Error', 'Password must be at least 6 characters long', 'error')
    return
  }

  isResetting.value = true
  try {
  const API_BASE = process.env.VUE_APP_API_BASE || 'http://localhost:4000/api'
    await axios.post(`${API_BASE}/reset-password`, {
      token: token,
      password: newPassword.value
    })
    
    Swal.fire('Success', 'Password reset successfully! You can now login with your new password.', 'success')
    router.push('/profile')
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to reset password', 'error')
  } finally {
    isResetting.value = false
  }
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8fafc;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.error-message {
  color: #dc2626;
  text-align: center;
  margin-bottom: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  margin-top: 1rem;
}
</style>