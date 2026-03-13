<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top glass-nav" :class="{ scrolled: isScrolled }">
    <div class="container-fluid px-3 px-lg-5">
      <router-link to="/" class="navbar-brand fw-bold">
        🎵 Music<span class="text-warning">Store</span>
      </router-link>

      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="mainNavbar" aria-labelledby="mainNavbarLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="mainNavbarLabel">เมนู</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body d-lg-flex align-items-center justify-content-between">
          <ul class="navbar-nav gap-lg-2 mb-3 mb-lg-0">
            <li class="nav-item">
              <router-link to="/" class="nav-link">หน้าแรก</router-link>
            </li>

            <li class="nav-item">
              <router-link to="/products" class="nav-link">📦 สินค้า</router-link>
            </li>

            <li class="nav-item" v-if="auth.user?.role === 'admin'">
              <router-link to="/admin" class="nav-link">🛠️ Admin</router-link>
            </li>

            <li class="nav-item">
              <router-link to="/cart" class="nav-link d-inline-flex align-items-center gap-2">
                <span>🛒 ตะกร้า</span>
                <span v-if="cart.items.length > 0" class="badge rounded-pill text-bg-danger">
                  {{ cart.items.length }}
                </span>
              </router-link>
            </li>
          </ul>

          <div class="d-flex flex-column flex-lg-row gap-2">
            <template v-if="auth.isAuthenticated">
              <router-link to="/profile" class="btn btn-outline-light btn-sm">
                {{ auth.user?.name }}
              </router-link>
              <button class="btn btn-warning btn-sm" @click="handleLogout">Logout</button>
            </template>

            <template v-else>
              <router-link to="/login" class="btn btn-outline-light btn-sm">Login</router-link>
              <router-link to="/register" class="btn btn-warning btn-sm fw-bold">Register</router-link>
            </template>
          </div>
        </div>
      </div>
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
.glass-nav {
  min-height: 76px;
  background: var(--bg-nav);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-nav.scrolled {
  background: rgba(19, 25, 33, 0.95);
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.22);
}

.navbar-brand {
  font-weight: 800;
  letter-spacing: 0.2px;
  font-size: 1.45rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.84);
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 10px;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff;
  background: rgba(245, 158, 11, 0.22);
}

.offcanvas {
  max-width: 320px;
}

@media (max-width: 991px) {
  .navbar-brand {
    font-size: 1.25rem;
  }
}
</style>
