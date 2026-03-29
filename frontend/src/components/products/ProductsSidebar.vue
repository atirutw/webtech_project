<template>
  <aside class="sidebar">
    <div class="sidebar-head">
      <h3>หมวดหมู่</h3>
    </div>
    <ul>
      <li :class="{ active: selectedCategory === 'all' }" @click="$emit('allProducts')">
        ทั้งหมด ({{ catalogTotalCount }})
      </li>
      <li
        v-for="entry in categoryItems"
        :key="entry.category"
        :class="{ active: selectedCategory === entry.category }"
        @click="$emit('categorySelected', entry.category)">
        {{ entry.displayName || entry.category }} ({{ entry.count }})
      </li>
    </ul>
  </aside>
</template>

<script setup>
defineProps({
  selectedCategory: {
    type: String,
    required: true
  },
  catalogTotalCount: {
    type: Number,
    required: true
  },
  categoryItems: {
    type: Array,
    required: true
  }
})

defineEmits(['allProducts', 'categorySelected'])
</script>
