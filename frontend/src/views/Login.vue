<template>
  <div class="login-page">
    <!-- ดาว -->
    <div class="stars"></div>

    <div class="login-card">
      <h1>Welcome Back</h1>
      <p class="subtitle">Login to your Music World 🎵</p>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input v-model="email" type="email" required />
          <label>Email</label>
        </div>

        <div class="input-group">
          <input v-model="password" type="password" required />
          <label>Password</label>
        </div>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <p class="register-link">
        ยังไม่มีบัญชี?
        <router-link to="/register">สมัครสมาชิก</router-link>
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
  background: url('@/assets/music.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ดาว */
.stars {
  position: absolute;
  width: 200%;
  height: 200%;
  background: transparent;
  box-shadow:
    100px 200px #fff,
    300px 400px #fff,
    600px 100px #fff,
    800px 500px #fff,
    1200px 300px #fff,
    1500px 600px #fff,
    1800px 200px #fff;
  animation: twinkle 4s infinite alternate;
}

@keyframes twinkle {
  from { opacity: 0.3; }
  to { opacity: 1; }
}

/* กล่อง */
.login-card {
  position: relative;
  width: 400px;
  padding: 45px;
  border-radius: 25px;
  background: rgba(10, 10, 40, 0.9);
  backdrop-filter: blur(15px);
  box-shadow:
    0 0 25px gold,
    0 0 60px rgba(255, 200, 0, 0.6);
  color: white;
  text-align: center;
  animation: float 4s ease-in-out infinite;
  z-index: 2;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.login-card h1 {
  margin-bottom: 10px;
  font-size: 30px;
  color: gold;
  text-shadow: 0 0 15px gold;
}

.subtitle {
  font-size: 14px;
  margin-bottom: 30px;
  opacity: 0.8;
}

/* Input */
.input-group {
  position: relative;
  margin-bottom: 25px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: none;
  border-bottom: 2px solid #aaa;
  background: transparent;
  color: white;
  font-size: 14px;
  outline: none;
}

.input-group label {
  position: absolute;
  left: 0;
  top: 12px;
  font-size: 14px;
  color: #ccc;
  pointer-events: none;
  transition: 0.3s;
}

.input-group input:focus + label,
.input-group input:valid + label {
  top: -10px;
  font-size: 12px;
  color: gold;
}

/* ปุ่ม */
button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 40px;
  background: linear-gradient(45deg, gold, orange);
  color: black;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  transform: scale(1.08);
  box-shadow: 0 0 25px gold;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  margin-top: 12px;
  color: #ff6b6b;
  font-size: 13px;
}

.register-link {
  margin-top: 20px;
  font-size: 13px;
}

.register-link a {
  color: gold;
  text-decoration: none;
}
</style>
