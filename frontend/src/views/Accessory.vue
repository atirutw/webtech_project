<template>
  <div class="page page-shell">

    <!-- Header Section -->
    <div class="header">
      <h1>
        <i class="bi bi-headphones" aria-hidden="true"></i>
        อุปกรณ์เสริม
      </h1>

      <div class="filter-box">
        <label>เลือกแบรนด์:</label>
        <select v-model="selectedBrand" class="market-select">
          <option value="">ทั้งหมด</option>
          <option v-for="brand in brands" :key="brand" :value="brand">
            {{ brand }}
          </option>
        </select>
      </div>
    </div>

    <p v-if="errorMessage" class="empty">{{ errorMessage }}</p>
    <p v-if="isLoading" class="empty">กำลังโหลดสินค้า...</p>

    <!-- Product Grid -->
    <div class="grid">
      <div
        v-for="item in filteredProducts"
        :key="item.id"
        class="card"
      >
        <div class="image-box">
          <img :src="item.image || fallbackImage" />
        </div>

        <div class="info">
          <h3>{{ item.name }}</h3>
          <p class="brand">{{ item.brand }}</p>
          <p class="price">{{ item.price }} บาท</p>

          <button class="market-btn-primary" @click="addToCart(item)">
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </div>

    <div v-if="!errorMessage && !isLoading && filteredProducts.length === 0" class="empty">
      ไม่มีสินค้าในหมวดนี้
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const selectedBrand = ref('')
const products = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const fallbackImage = '/src/assets/music.jpg'

const brands = computed(() => {
  const allBrands = products.value
    .map((product) => product.brand)
    .filter(Boolean)

  return [...new Set(allBrands)]
})

const filteredProducts = computed(() => {
  if (!selectedBrand.value) return products.value
  return products.value.filter(p => p.brand === selectedBrand.value)
})

const fetchAccessories = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/products', {
      params: {
        type: 'accessory',
        page: 1,
        limit: 50,
        sort: 'default'
      }
    })

    products.value = response.data.items || []
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดสินค้าไม่สำเร็จ'
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const addToCart = (product) => {
  cartStore.addToCart(product)
}

onMounted(fetchAccessories)
</script>

<style scoped>

.page {
  position: relative;
  padding-top: 20px;
  padding-bottom: 30px;
  min-height: 100vh;
  color: var(--text-primary);
}

/* เพิ่ม glow effect แบบหน้าแรก */
.page::before {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,193,7,0.15), transparent 70%);
  top: -200px;
  right: -200px;
  z-index: 0;
}

.page::after {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%);
  bottom: -200px;
  left: -200px;
  z-index: 0;
}

/* ทำให้เนื้อหาอยู่เหนือ glow */
.header,
.grid,
.empty {
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.header h1 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.4rem, 2vw, 1.9rem);
  font-weight: 700;
  margin: 0;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  box-shadow: var(--shadow-card);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 26px rgba(17, 24, 39, 0.14);
}

.image-box {
  height: 170px;
  overflow: hidden;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.4s;
}

.card:hover img {
  transform: scale(1.04);
}

.info {
  padding: 12px;
}

.info h3 {
  margin: 0;
  font-size: 1.05rem;
}

.brand {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 5px 0;
}

.price {
  font-size: 1rem;
  font-weight: 800;
  margin: 10px 0;
  color: #c2410c;
}

button {
  width: 100%;
}

.empty {
  margin-top: 50px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-box {
    width: 100%;
  }

  .filter-box select {
    width: 100%;
  }
}

</style>
