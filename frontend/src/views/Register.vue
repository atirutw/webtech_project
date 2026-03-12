<template>
  <div class="register-page">
    <div class="bg-overlay"></div>

    <div class="register-card card border-0 shadow-lg p-4 p-md-5">
      <h1 class="text-warning mb-2">Create Account</h1>
      <p class="subtitle text-light-emphasis mb-4">Join our Music World ✨</p>

      <form @submit.prevent="handleRegister" class="d-grid gap-3">
        <div class="form-floating">
          <input
            v-model="name"
            type="text"
            class="form-control form-control-lg bg-dark-subtle border-secondary"
            id="name"
            placeholder="Full Name"
            required
          />
          <label for="name">Full Name</label>
        </div>

        <div class="form-floating">
          <input
            v-model="email"
            type="email"
            class="form-control form-control-lg bg-dark-subtle border-secondary"
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
            class="form-control form-control-lg bg-dark-subtle border-secondary"
            id="password"
            placeholder="Password"
            required
          />
          <label for="password">Password</label>
        </div>

        <div class="form-floating">
          <input
            v-model="adminKey"
            type="password"
            class="form-control form-control-lg bg-dark-subtle border-secondary"
            id="adminKey"
            placeholder="Admin Key (optional)"
          />
          <label for="adminKey">Admin Key (optional)</label>
        </div>

        <button type="submit" class="btn btn-warning btn-lg fw-semibold" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSubmitting ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0 py-2" role="alert">
        {{ errorMessage }}
      </div>

      <p class="login-link mt-4 mb-0 text-light">
        Already have an account?
        <router-link to="/login" class="text-warning">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

import { useAuthStore } from "../stores/auth"
import { useCartStore } from "../stores/cart"

const name = ref("")
const email = ref("")
const password = ref("")
const adminKey = ref("")
const errorMessage = ref("")
const isSubmitting = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const handleRegister = async () => {
  errorMessage.value = ""
  isSubmitting.value = true

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      adminKey: adminKey.value || undefined
    })
    await cartStore.mergeGuestCartIntoServerCart()
    await cartStore.loadCart()

    router.push("/")
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Register failed"
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  background: url('/src/assets/register-bg.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 16px 40px;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.register-card {
  position: relative;
  width: 440px;
  max-width: 100%;
  border-radius: 20px;
  background: rgba(10, 10, 40, 0.85);
  backdrop-filter: blur(15px);
  z-index: 2;
}

.register-card h1 {
  font-size: 30px;
  text-align: center;
}

.subtitle {
  font-size: 14px;
}

.login-link {
  text-align: center;
}
</style>
