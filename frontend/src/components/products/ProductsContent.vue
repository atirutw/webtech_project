<template>
  <section class="content">
    <header class="content-head">
      <h1>
        <i :class="`bi ${pageIconClass}`" aria-hidden="true"></i>
        {{ pageTitle }}
      </h1>
      <p>{{ totalItems }} รายการ</p>
    </header>

    <div class="top-bar">
      <input
        :value="searchText"
        type="text"
        class="market-input search-input"
        placeholder="ค้นหาสินค้า..."
        @input="$emit('updateSearchText', $event.target.value)" />

      <select :value="sortOption" class="market-select" @change="$emit('updateSortOption', $event.target.value)">
        <option value="default">เรียงตามปกติ</option>
        <option value="lowToHigh">ราคาต่ำ → สูง</option>
        <option value="highToLow">ราคาสูง → ต่ำ</option>
      </select>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="isLoading" class="loading-message">กำลังโหลดสินค้า...</p>

    <div class="grid" v-if="!isLoading && paginatedProducts.length > 0">
      <article class="card" v-for="product in paginatedProducts" :key="product.id">
        <img :src="product.image || fallbackImage" />
        <div class="meta">
          <h3>{{ product.name }}</h3>
          <p class="brand">{{ product.brand }}</p>
          <p class="price">{{ product.price.toLocaleString() }} บาท</p>

          <button class="market-btn-primary cart-btn" @click="$emit('addToCart', product)">
            เพิ่มลงตะกร้า
          </button>
          <router-link class="btn btn-outline-secondary btn-sm mt-2" :to="`/products/${product.id}`">
            ดูรายละเอียด
          </router-link>
        </div>
      </article>
    </div>

    <p v-if="!isLoading && paginatedProducts.length === 0" class="loading-message">
      ไม่พบสินค้า
    </p>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="$emit('changePage', currentPage - 1)" aria-label="Previous page">
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ activePage: currentPage === page }"
        @click="$emit('changePage', page)">
        {{ page }}
      </button>

      <button :disabled="currentPage === totalPages" @click="$emit('changePage', currentPage + 1)" aria-label="Next page">
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  pageIconClass: {
    type: String,
    required: true
  },
  pageTitle: {
    type: String,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  searchText: {
    type: String,
    required: true
  },
  sortOption: {
    type: String,
    required: true
  },
  errorMessage: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    required: true
  },
  paginatedProducts: {
    type: Array,
    required: true
  },
  fallbackImage: {
    type: String,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits([
  'updateSearchText',
  'updateSortOption',
  'addToCart',
  'changePage'
])
</script>
