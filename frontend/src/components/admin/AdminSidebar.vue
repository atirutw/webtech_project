<template>
  <aside class="admin-sidebar">
    <h1 class="h4 mb-2">Admin Panel</h1>
    <p class="sidebar-subtitle">เลือกหมวดการจัดการ</p>

    <div class="sidebar-nav" role="tablist" aria-label="Admin categories">
      <button
        class="sidebar-item"
        :class="{ active: activeSection === 'dashboard' }"
        @click="$emit('changeSection', 'dashboard')">
        <span class="sidebar-item-title">Command Center</span>
        <span class="sidebar-item-meta">ภาพรวมธุรกิจ</span>
      </button>

      <button
        class="sidebar-item"
        :class="{ active: activeSection === 'products' }"
        @click="$emit('changeSection', 'products')">
        <span class="sidebar-item-title">จัดการสินค้า</span>
        <span class="sidebar-item-meta">{{ productCount }} รายการ</span>
      </button>

      <button
        class="sidebar-item"
        :class="{ active: activeSection === 'users' }"
        @click="$emit('changeSection', 'users')">
        <span class="sidebar-item-title">จัดการผู้ใช้</span>
        <span class="sidebar-item-meta">{{ userCount }} บัญชี</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  activeSection: {
    type: String,
    required: true
  },
  productCount: {
    type: Number,
    required: true
  },
  userCount: {
    type: Number,
    required: true
  }
})

defineEmits(['changeSection'])
</script>
