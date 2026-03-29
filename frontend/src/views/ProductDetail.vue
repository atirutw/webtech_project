<template>
  <div class="product-detail-page page-shell">
    <section class="detail-card" v-if="product">
      <div class="image-wrap">
        <img :src="product.image || fallbackImage" :alt="product.name" />
      </div>

      <div class="content-wrap">
        <p class="category-chip">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p class="brand">แบรนด์: {{ product.brand || '-' }}</p>
        <p class="price">{{ product.price.toLocaleString() }} บาท</p>
        <p class="stock">คงเหลือ {{ product.stock }} ชิ้น</p>

        <div class="actions">
          <button class="market-btn-primary" :disabled="product.stock <= 0" @click="addToCart(product)">
            {{ product.stock > 0 ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด' }}
          </button>
          <router-link to="/products" class="btn btn-outline-secondary">กลับหน้าสินค้า</router-link>
        </div>
      </div>
    </section>

    <p v-if="isLoading" class="state-text">กำลังโหลดรายละเอียดสินค้า...</p>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const fallbackImage = '/src/assets/music.jpg'

const loadProduct = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get(`/products/${route.params.id}`)
    product.value = response.data.item
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดรายละเอียดสินค้าไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

const addToCart = (item) => {
  cartStore.addToCart(item)
}

onMounted(async () => {
  await loadProduct()
})
</script>

<style scoped>
.detail-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(220px, 360px) 1fr;
  gap: 20px;
}

.image-wrap img {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--border);
  object-fit: cover;
  aspect-ratio: 1 / 1;
}

.category-chip {
  margin: 0;
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #ffedd5;
  color: #9a3412;
  font-size: 0.82rem;
  font-weight: 700;
}

.content-wrap h1 {
  margin: 10px 0 8px;
  font-size: clamp(1.4rem, 2vw, 2rem);
}

.brand,
.stock {
  margin: 8px 0;
  color: var(--text-secondary);
}

.price {
  margin: 10px 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.state-text,
.error-text {
  margin: 10px 0;
}

.error-text {
  color: #b91c1c;
}

@media (max-width: 860px) {
  .detail-card {
    grid-template-columns: 1fr;
  }
}
</style>
