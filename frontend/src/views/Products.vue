<template>
  <div class="products-page page-shell">
    <ProductsSidebar
      :selected-category="selectedCategory"
      :catalog-total-count="catalogTotalCount"
      :category-items="categoryItems"
      @all-products="goAllProducts"
      @category-selected="goCategory" />

    <ProductsContent
      :page-icon-class="pageIconClass"
      :page-title="pageTitle"
      :total-items="totalItems"
      :search-text="searchText"
      :sort-option="sortOption"
      :error-message="errorMessage"
      :is-loading="isLoading"
      :paginated-products="paginatedProducts"
      :fallback-image="fallbackImage"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update-search-text="searchText = $event"
      @update-sort-option="sortOption = $event"
      @add-to-cart="addToCart"
      @change-page="goToPage" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ProductsContent from '../components/products/ProductsContent.vue'
import ProductsSidebar from '../components/products/ProductsSidebar.vue'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

/* ================= DATA ================= */

const searchText = ref('')
const sortOption = ref('default')
const selectedCategory = ref('all')
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
  if (selectedCategory.value !== 'all') {
    const match = categoryItems.value.find((item) => item.category === selectedCategory.value)
    if (match) {
      return match.displayName || match.category
    }
  }

  return 'สินค้าทั้งหมด'
})

const pageIconClass = computed(() => {
  if (selectedCategory.value !== 'all') {
    return 'bi-tag'
  }

  return 'bi-grid-3x3-gap'
})

const catalogTotalCount = computed(() => categoryItems.value.reduce((sum, item) => sum + item.count, 0))

/* ================= CATEGORY ================= */

const goAllProducts = () => {
  selectedCategory.value = 'all'
  currentPage.value = 1
  router.push('/products')
}

const goCategory = (cat) => {
  selectedCategory.value = cat
  currentPage.value = 1

  router.push(`/category/${cat}`)
}

watch(() => route.params.categoryName, (val) => {
  selectedCategory.value = val || 'all'

  currentPage.value = 1
}, { immediate: true })

const fetchCategories = async () => {
  const response = await api.get('/products/categories')

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
        sort: sortOption.value
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

watch([searchText, sortOption, selectedCategory, currentPage], fetchProducts)

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})

/* ================= CART ================= */

const addToCart = (product) => {
  cartStore.addToCart(product)
}
</script>

<style>
.products-page {
  display: flex;
  gap: 22px;
  align-items: flex-start;
}

.sidebar {
  width: 260px;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  position: sticky;
  top: 90px;
  overflow: hidden;
}

.sidebar-head {
  padding: 16px 16px 10px;
  border-bottom: 1px solid var(--border);
}

.sidebar h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.sidebar ul {
  list-style: none;
  padding: 12px;
  margin: 0;
}

.group-title {
  margin: 6px 14px 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sidebar li {
  padding: 10px 12px;
  cursor: pointer;
  margin-bottom: 4px;
  border-radius: 10px;
  transition: background-color 0.15s ease, color 0.15s ease;
  color: var(--text-secondary);
  font-weight: 600;
}

.sidebar li:hover {
  background: #f9fafb;
  color: var(--text-primary);
}

.sidebar li.active {
  background: #fff7ed;
  color: #9a3412;
}

.content {
  flex: 1;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  padding: 20px;
}

.content-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.content-head h1 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.35rem, 2vw, 1.85rem);
}

.content-head p {
  margin: 0;
  color: var(--text-secondary);
  font-weight: 600;
}

.top-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-input {
  min-width: 260px;
  flex: 1;
}

.loading-message,
.error-message {
  margin: 10px 2px 14px;
  color: var(--text-secondary);
}

.error-message {
  color: #b91c1c;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(17, 24, 39, 0.14);
}

.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.meta {
  padding: 12px;
}

.meta h3 {
  margin: 0 0 4px;
  line-height: 1.25;
  font-size: 1.02rem;
}

.price {
  color: #c2410c;
  font-weight: 800;
  margin: 8px 0 0;
}

.pagination {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination button {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  cursor: pointer;
  border-radius: 8px;
  background: var(--bg-surface-soft);
  color: var(--text-primary);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.pagination button:hover {
  background: #fff7ed;
  color: #9a3412;
}

.activePage {
  background: var(--accent) !important;
  color: #111827 !important;
  border-color: #f59e0b !important;
  font-weight: 700;
}

.brand {
  margin: 0;
  color: var(--text-secondary);
}

@media (max-width: 1080px) {
  .products-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: static;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 14px;
  }

  .content-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .search-input {
    min-width: 100%;
  }
}
</style>
