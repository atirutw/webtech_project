<template>
  <div class="layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <h3>หมวดหมู่</h3>
      <ul>
        <li
          :class="{ active: selectedCategory === 'all' }"
          @click="goCategory('all')"
        >
          ทั้งหมด ({{ totalItems }})
        </li>

        <li
          v-for="entry in categoryItems"
          :key="entry.category"
          :class="{ active: selectedCategory === entry.category }"
          @click="goCategory(entry.category)"
        >
          {{ entry.displayName || entry.category }} ({{ entry.count }})
        </li>
      </ul>
    </aside>

    <!-- CONTENT -->
    <div class="content">

      <h1>{{ pageTitle }}</h1>

      <!-- FILTER BAR -->
      <div class="top-bar">

        <!-- Search -->
        <input
          type="text"
          v-model="searchText"
          placeholder="ค้นหาสินค้า..."
        />

        <!-- Sort -->
        <select v-model="sortOption">
          <option value="default">เรียงตามปกติ</option>
          <option value="lowToHigh">ราคาต่ำ → สูง</option>
          <option value="highToLow">ราคาสูง → ต่ำ</option>
        </select>

        <select v-model="selectedType" @change="onTypeChange">
          <option value="all">ทุกประเภท</option>
          <option value="instrument">เครื่องดนตรี</option>
          <option value="accessory">อุปกรณ์เสริม</option>
        </select>

      </div>

      <!-- PRODUCT GRID -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="isLoading" class="loading-message">กำลังโหลดสินค้า...</p>
      <div class="grid">
        <div
          class="card"
          v-for="product in paginatedProducts"
          :key="product.id"
        >
          <img :src="product.image || fallbackImage" />
          <h3>{{ product.name }}</h3>
          <p class="brand">{{ product.brand }}</p>
          <p class="price">{{ product.price.toLocaleString() }} บาท</p>

          <button class="cart-btn" @click="addToCart(product)">
            เพิ่มลงตะกร้า 🛒
          </button>

        </div>
      </div>

      <p v-if="!isLoading && paginatedProducts.length === 0" class="loading-message">
        ไม่พบสินค้า
      </p>

      <!-- PAGINATION -->
      <div class="pagination" v-if="totalPages > 1">

        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ◀
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ activePage: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          ▶
        </button>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

/* ================= DATA ================= */

const searchText = ref('')
const sortOption = ref('default')
const selectedCategory = ref('all')
const selectedType = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6
const products = ref([])
const categoryItems = ref([])
const totalItems = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const errorMessage = ref('')
const fallbackImage = '/src/assets/music.jpg'
const pageTitle = computed(() => {
  if (selectedType.value === 'instrument') {
    return '🎸 เครื่องดนตรี'
  }

  if (selectedType.value === 'accessory') {
    return '🎧 อุปกรณ์เสริม'
  }

  return '🎼 สินค้าทั้งหมด'
})

/* ================= CATEGORY ================= */

const goCategory = (cat) => {
  selectedCategory.value = cat
  currentPage.value = 1

  if (cat === 'all') {
    router.push('/products')
  } else {
    router.push(`/category/${cat}`)
  }
}

watch(() => route.params.categoryName, (val) => {
  selectedCategory.value = val || 'all'
  currentPage.value = 1
}, { immediate: true })

const onTypeChange = () => {
  selectedCategory.value = 'all'
  currentPage.value = 1

  if (route.params.categoryName) {
    router.push('/products')
  }
}

const fetchCategories = async () => {
  const params = {}

  if (selectedType.value !== 'all') {
    params.type = selectedType.value
  }

  const response = await api.get('/products/categories', {
    params
  })

  categoryItems.value = response.data.categories || []
}

const fetchProducts = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/products', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
        category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
        search: searchText.value || undefined,
        sort: sortOption.value,
        type: selectedType.value === 'all' ? undefined : selectedType.value
      }
    })

    products.value = response.data.items || []
    totalPages.value = response.data.totalPages || 1
    totalItems.value = response.data.total || 0
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดสินค้าไม่สำเร็จ'
    products.value = []
    totalPages.value = 1
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

/* ================= FILTER ================= */

/* ================= PAGINATION ================= */

const paginatedProducts = computed(() => products.value)

const goToPage = (page) => {
  currentPage.value = page
}

watch([searchText, sortOption, selectedCategory, currentPage, selectedType], fetchProducts)
watch(selectedType, fetchCategories)

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})

/* ================= CART ================= */

const addToCart = (product) => {
  cartStore.addToCart(product)
}
</script>

<style scoped>
.layout {
  display: flex;
  color: white;
}

/* Sidebar */
.sidebar {
  width: 220px;
  padding: 20px;
  background: rgba(0,0,0,0.7);
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 8px;
  cursor: pointer;
  margin-bottom: 6px;
  border-radius: 6px;
  transition: 0.2s;
}

.sidebar li:hover {
  background: rgba(255,255,255,0.1);
}

.sidebar li.active {
  background: #ffc107;
  color: black;
}

/* Content */
.content {
  flex: 1;
  padding: 40px;
}

.top-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.loading-message,
.error-message {
  margin: 8px 0 14px;
}

.error-message {
  color: #ffb3b3;
}

input, select {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.card {
  background: rgba(0,0,0,0.6);
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
}

.price {
  color: #ffc107;
  font-weight: bold;
}

/* Cart Button */
.cart-btn {
  margin-top: 10px;
  padding: 8px;
  border: none;
  background: #ffc107;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.cart-btn:hover {
  background: #ffca2c;
}

/* Pagination */
.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  background: rgba(255,255,255,0.1);
  color: white;
  transition: 0.2s;
}

.pagination button:hover {
  background: #ffc107;
  color: black;
}

.activePage {
  background: #ffc107 !important;
  color: black;
  font-weight: bold;
}
</style>
