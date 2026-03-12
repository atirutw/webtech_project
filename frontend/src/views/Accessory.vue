<template>
  <div class="page">

    <!-- Header Section -->
    <div class="header">
      <h1>🎧 อุปกรณ์เสริม</h1>

      <div class="filter-box">
        <label>เลือกแบรนด์:</label>
        <select v-model="selectedBrand">
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

          <button @click="addToCart(item)">
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
  padding: 40px 80px;
  min-height: 100vh;
  color: white;
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

.header h1 {
  font-size: 32px;
  font-weight: 600;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

select {
  padding: 8px 15px;
  border-radius: 8px;
  border: none;
  outline: none;
  font-weight: 500;
}

/* ===== Grid ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
}

/* ===== Card ===== */
.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  overflow: hidden;
  transition: 0.4s;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
}

.card:hover {
  transform: translateY(-10px);
}

/* Image */
.image-box {
  height: 200px;
  overflow: hidden;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.4s;
}

.card:hover img {
  transform: scale(1.1);
}

/* Info */
.info {
  padding: 20px;
}

.brand {
  font-size: 14px;
  opacity: 0.7;
  margin: 5px 0;
}

.price {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
  color: #ffc107;
}

/* Button */
button {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background: linear-gradient(45deg, #ffc107, #ff9800);
  transition: 0.3s;
}

button:hover {
  transform: scale(1.05);
}

/* Empty */
.empty {
  margin-top: 60px;
  text-align: center;
  opacity: 0.6;
  font-size: 18px;
}

</style>
