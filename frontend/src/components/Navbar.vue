<template>
  <nav :class="['navbar', { scrolled: isScrolled }]">

    <!-- LOGO -->
    <div class="logo">
      🎵 Music<span>Store</span>
    </div>

    <!-- เมนูกลาง -->
    <div class="center">
      <router-link to="/" class="nav-link">หน้าแรก</router-link>

      <router-link to="/products" class="nav-link">
        📦 สินค้า
      </router-link>

      <router-link v-if="auth.user?.role === 'admin'" to="/admin" class="nav-link">
        🛠️ Admin
      </router-link>

      <!-- ตะกร้า + Badge -->
      <router-link to="/cart" class="nav-link cart-link">
        🛒 ตะกร้า
        <span v-if="cart.items.length > 0" class="cart-badge">
          {{ cart.items.length }}
        </span>
      </router-link>
    </div>

    <!-- ด้านขวา -->
    <div class="right">
      <template v-if="auth.isAuthenticated">
        <router-link to="/profile" class="user-pill">{{ auth.user?.name }}</router-link>
        <button class="login-btn" @click="handleLogout">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="login-btn">Login</router-link>
        <router-link to="/register" class="register-btn">Register</router-link>
      </template>
    </div>

  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>

/* ===== Navbar ===== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 75px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 80px;
  box-sizing: border-box;

  background: rgba(10, 10, 20, 0.5);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  transition: all 0.3s ease;
  z-index: 1000;
}

.navbar.scrolled {
  background: rgba(10, 10, 20, 0.9);
  height: 65px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.4);
}

/* ===== Logo ===== */
.logo {
  font-size: 24px;
  font-weight: bold;
  color: white;
  letter-spacing: 1px;
}

.logo span {
  color: #ffc107;
}

/* ===== เมนูกลาง ===== */
.center {
  display: flex;
  gap: 50px;
  align-items: center;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: white;
  font-weight: 500;
  font-size: 15px;
  transition: 0.3s;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0%;
  height: 2px;
  left: 0;
  bottom: -6px;
  background: #ffc107;
  transition: 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link:hover {
  color: #ffc107;
}

.router-link-active {
  color: #ffc107 !important;
}

/* ===== Cart Badge ===== */
.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #ff3c3c;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 50px;
  font-weight: bold;
}

/* ===== Right Buttons ===== */
.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.user-pill {
  border: 1px solid rgba(255,255,255,0.4);
  padding: 7px 14px;
  border-radius: 999px;
  color: white;
  font-size: 14px;
}

.login-btn {
  border: 1px solid rgba(255,255,255,0.6);
  padding: 7px 20px;
  border-radius: 8px;
  background: transparent;
  text-decoration: none;
  color: white;
  transition: 0.3s;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}

.login-btn:hover {
  background: white;
  color: black;
}

.register-btn {
  background: linear-gradient(45deg,#ffc107,#ff9800);
  padding: 8px 22px;
  border-radius: 8px;
  text-decoration: none;
  color: black;
  font-weight: bold;
  transition: 0.3s;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.4);
}

</style>
