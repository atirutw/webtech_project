<template>
  <div class="login-page">
    <div class="bg-overlay"></div>

    <div class="login-card card border-0 shadow-lg p-4 p-md-5">
      <h1 class="text-warning mb-2">
        <i class="bi bi-person-circle me-2" aria-hidden="true"></i>
        Welcome Back
      </h1>
      <p class="subtitle mb-4">Login to your Music World</p>

      <form @submit.prevent="handleLogin" class="d-grid gap-3">
        <div class="form-floating">
          <input
            v-model="email"
            type="email"
            class="form-control form-control-lg market-auth-input"
            id="email"
            placeholder="Email"
            required
          />
          <label for="email">Email</label>
        </div>

        <div class="form-floating">
          <input
            v-model="password"
            type="password"
            class="form-control form-control-lg market-auth-input"
            id="password"
            placeholder="Password"
            required
          />
          <label for="password">Password</label>
        </div>

        <button type="submit" class="btn btn-warning btn-lg fw-semibold" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSubmitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0 py-2" role="alert">
        {{ errorMessage }}
      </div>

      <p class="register-link mt-4 mb-0">
        ยังไม่มีบัญชี?
        <router-link to="/register" class="text-warning">สมัครสมาชิก</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

import { useAuthStore } from "../stores/auth"
import { useCartStore } from "../stores/cart"

const email = ref("")
const password = ref("")
const errorMessage = ref("")
const isSubmitting = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const handleLogin = async () => {
  errorMessage.value = ""
  isSubmitting.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    await cartStore.mergeGuestCartIntoServerCart()
    await cartStore.loadCart()

    router.push("/")
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Login failed"
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  background: url('/src/assets/music.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 16px 40px;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.62);
}

.login-card {
  position: relative;
  width: 440px;
  max-width: 100%;
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg-surface), transparent 6%);
  border: 1px solid var(--border);
  backdrop-filter: blur(15px);
  z-index: 2;
  color: var(--text-primary);
}

.login-card h1 {
  font-size: 30px;
  text-align: center;
}

.subtitle {
  font-size: 14px;
  text-align: center;
  color: var(--text-secondary);
}

.market-auth-input {
  background: var(--bg-surface-soft);
  border-color: var(--border);
  color: var(--text-primary);
}

.market-auth-input:focus {
  background: var(--bg-surface-soft);
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.register-link {
  color: var(--text-secondary);
}

.register-link {
  text-align: center;
}
</style>
