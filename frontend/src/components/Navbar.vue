<template>
  <nav class="market-nav fixed-top" :class="{ scrolled: isScrolled }">
    <div class="container-fluid nav-shell-wrap">
      <div class="nav-shell market-surface">
        <router-link to="/" class="brand-link">
          <span class="brand-mark" aria-hidden="true">
            <i class="bi bi-vinyl-fill"></i>
          </span>
          <span class="brand-text">Music<span class="brand-accent">Store</span></span>
        </router-link>

        <ul class="nav-center d-none d-lg-flex">
          <li>
            <router-link to="/" class="nav-pill" :class="{ active: isHomeRoute }">
              <i class="bi bi-house-door" aria-hidden="true"></i>
              หน้าแรก
            </router-link>
          </li>
          <li>
            <router-link to="/products" class="nav-pill" :class="{ active: isProductsRoute }">
              <i class="bi bi-box-seam" aria-hidden="true"></i>
              สินค้า
            </router-link>
          </li>
          <li v-if="auth.isAuthenticated">
            <router-link to="/orders" class="nav-pill" :class="{ active: isOrdersRoute }">
              <i class="bi bi-receipt-cutoff" aria-hidden="true"></i>
              ประวัติการซื้อ
            </router-link>
          </li>
          <li v-if="auth.user?.role === 'admin'">
            <router-link to="/admin" class="nav-pill" :class="{ active: isAdminRoute }">
              <i class="bi bi-shield-lock" aria-hidden="true"></i>
              Admin
            </router-link>
          </li>
        </ul>

        <div class="nav-actions d-none d-lg-flex">
          <router-link to="/cart" class="cart-link" :class="{ active: isCartRoute }">
            <i class="bi bi-cart3" aria-hidden="true"></i>
            <span>ตะกร้า</span>
            <span v-if="cart.items.length > 0" class="cart-count">{{ cart.items.length }}</span>
          </router-link>

          <template v-if="auth.isAuthenticated">
            <router-link to="/profile" class="profile-link">
              <span class="avatar-badge">{{ userInitials }}</span>
              <span class="profile-name">{{ auth.user?.name }}</span>
            </router-link>
            <button class="btn signout-btn" @click="handleLogout">Logout</button>
          </template>

          <template v-else>
            <router-link to="/login" class="btn ghost-btn">Login</router-link>
            <router-link to="/register" class="btn market-btn-primary register-btn">Register</router-link>
          </template>
        </div>

        <button
          class="mobile-trigger d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-label="Toggle navigation"
        >
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
      </div>

      <div class="offcanvas offcanvas-end menu-drawer" tabindex="-1" id="mainNavbar" aria-labelledby="mainNavbarLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="mainNavbarLabel">เมนู</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body">
          <ul class="mobile-nav-list">
            <li>
              <router-link to="/" class="mobile-link" :class="{ active: isHomeRoute }" data-bs-dismiss="offcanvas">
                <i class="bi bi-house-door" aria-hidden="true"></i>
                หน้าแรก
              </router-link>
            </li>
            <li>
              <router-link to="/products" class="mobile-link" :class="{ active: isProductsRoute }" data-bs-dismiss="offcanvas">
                <i class="bi bi-box-seam" aria-hidden="true"></i>
                สินค้า
              </router-link>
            </li>
            <li v-if="auth.isAuthenticated">
              <router-link to="/orders" class="mobile-link" :class="{ active: isOrdersRoute }" data-bs-dismiss="offcanvas">
                <i class="bi bi-receipt-cutoff" aria-hidden="true"></i>
                ประวัติการซื้อ
              </router-link>
            </li>
            <li v-if="auth.user?.role === 'admin'">
              <router-link to="/admin" class="mobile-link" :class="{ active: isAdminRoute }" data-bs-dismiss="offcanvas">
                <i class="bi bi-shield-lock" aria-hidden="true"></i>
                Admin
              </router-link>
            </li>
            <li>
              <router-link to="/cart" class="mobile-link" :class="{ active: isCartRoute }" data-bs-dismiss="offcanvas">
                <i class="bi bi-cart3" aria-hidden="true"></i>
                ตะกร้า
                <span v-if="cart.items.length > 0" class="cart-count">{{ cart.items.length }}</span>
              </router-link>
            </li>
          </ul>

          <div class="mobile-actions">
            <template v-if="auth.isAuthenticated">
              <router-link to="/profile" class="btn ghost-btn w-100" data-bs-dismiss="offcanvas">{{ auth.user?.name }}</router-link>
              <button class="btn signout-btn w-100" @click="handleLogout" data-bs-dismiss="offcanvas">Logout</button>
            </template>

            <template v-else>
              <router-link to="/login" class="btn ghost-btn w-100" data-bs-dismiss="offcanvas">Login</router-link>
              <router-link to="/register" class="btn market-btn-primary w-100" data-bs-dismiss="offcanvas">Register</router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isScrolled = ref(false)

const userInitials = computed(() => {
  const name = auth.user?.name?.trim() || ''

  if (!name) {
    return 'U'
  }

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('')
})

const isHomeRoute = computed(() => route.path === '/')
const isProductsRoute = computed(() => route.path.startsWith('/products') || route.path.startsWith('/category/'))
const isOrdersRoute = computed(() => route.path.startsWith('/orders'))
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const isCartRoute = computed(() => route.path.startsWith('/cart'))

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
.market-nav {
  padding: 10px 0;
  transition: padding 0.18s ease;
}

.market-nav.scrolled {
  padding: 6px 0;
}

.nav-shell-wrap {
  position: relative;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-shell {
  min-height: 74px;
  border-radius: 18px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.3rem;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(140deg, var(--accent), var(--accent-strong));
  color: #111827;
}

.brand-accent {
  color: var(--accent-strong);
}

.nav-center {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-pill {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-weight: 700;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-pill:hover {
  background: var(--bg-surface-soft);
  color: var(--text-primary);
}

.nav-pill.active {
  background: color-mix(in srgb, var(--accent), transparent 82%);
  color: #9a3412;
}

.nav-actions {
  align-items: center;
  gap: 8px;
}

.cart-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  color: var(--text-primary);
  font-weight: 700;
  background: var(--bg-surface-soft);
}

.cart-link.active {
  border-color: color-mix(in srgb, var(--accent), transparent 42%);
}

.cart-count {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.profile-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  background: var(--bg-surface-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 5px 10px 5px 6px;
}

.avatar-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent), transparent 74%);
  color: #9a3412;
  font-weight: 700;
  font-size: 0.76rem;
}

.profile-name {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}

.ghost-btn,
.signout-btn {
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-surface-soft);
  color: var(--text-primary);
  font-weight: 700;
  padding: 8px 12px;
}

.register-btn {
  text-decoration: none;
}

.mobile-trigger {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-surface-soft);
  color: var(--text-primary);
  font-size: 1.2rem;
}

.menu-drawer {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.mobile-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-surface-soft);
  color: var(--text-primary);
  font-weight: 700;
  padding: 10px 12px;
}

.mobile-link.active {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
}

.mobile-actions {
  margin-top: 16px;
  display: grid;
  gap: 8px;
}

@media (prefers-color-scheme: dark) {
  .brand-accent,
  .nav-pill.active,
  .avatar-badge {
    color: #fbbf24;
  }
}

@media (max-width: 991px) {
  .market-nav {
    padding: 8px 0;
  }

  .nav-shell {
    min-height: 66px;
    border-radius: 14px;
  }

  .brand-link {
    font-size: 1.16rem;
  }
}

@media (max-width: 768px) {
  .nav-shell-wrap {
    padding: 0 12px;
  }
}
</style>
