<template>
  <div
    id="app"
    :style="{
      background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      paddingTop: '70px'
    }"
  >
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'
import bg from './assets/music.jpg'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initializeSession()
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>
