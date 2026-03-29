<template>
  <aside class="sidebar">
    <div class="sidebar-head">
      <h3>หมวดหมู่</h3>
    </div>
    <ul>
      <li :class="{ active: selectedFacet === 'all' }" @click="$emit('allProducts')">
        ทั้งหมด ({{ catalogTotalCount }})
      </li>
    </ul>

    <template v-for="group in groupedCategories" :key="group.type">
      <div class="group-title">{{ group.label }} ({{ group.count }})</div>
      <ul>
        <li
          :class="{ active: selectedFacet === `type:${group.type}` }"
          @click="$emit('typeSelected', group.type)">
          {{ group.label }}ทั้งหมด ({{ group.count }})
        </li>

        <li
          v-for="entry in group.items"
          :key="entry.category"
          :class="{ active: selectedFacet === `category:${entry.category}` }"
          @click="$emit('categorySelected', entry.category)">
          {{ entry.displayName || entry.category }} ({{ entry.count }})
        </li>
      </ul>
    </template>
  </aside>
</template>

<script setup>
defineProps({
  selectedFacet: {
    type: String,
    required: true
  },
  catalogTotalCount: {
    type: Number,
    required: true
  },
  groupedCategories: {
    type: Array,
    required: true
  }
})

defineEmits(['allProducts', 'typeSelected', 'categorySelected'])
</script>
