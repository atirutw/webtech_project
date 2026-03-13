<template>
  <div id="app" class="app-root">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(async () => {
  await authStore.initializeSession()
  await cartStore.mergeGuestCartIntoServerCart()
  await cartStore.loadCart()
})
</script>

<style>
.app-root {
  min-height: 100vh;
  padding-top: 76px;
}
</style>
