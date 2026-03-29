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
          <button class="btn btn-outline-warning" @click="toggleWishlist(product.id)">
            {{ isWishlisted(product.id) ? 'ลบออกจากรายการโปรด' : 'เพิ่มรายการโปรด' }}
          </button>
          <router-link to="/products" class="btn btn-outline-secondary">กลับหน้าสินค้า</router-link>
        </div>

        <div class="bundle-box" v-if="bundleCandidates.length > 0">
          <h2>Smart Bundle</h2>
          <p>
            จับคู่กับ {{ bundleCandidates.length }} ชิ้นแนะนำ เพิ่มลงตะกร้าครั้งเดียวได้ทันที
          </p>
          <button class="btn btn-outline-dark" @click="addBundleToCart">
            เพิ่มเป็นเซ็ต ({{ bundleTotal.toLocaleString() }} บาท)
          </button>
        </div>
      </div>
    </section>

    <section class="recommend-card" v-if="recommendations.length > 0">
      <div class="section-head">
        <h2>สินค้าแนะนำอัจฉริยะ</h2>
      </div>

      <div class="recommend-grid">
        <article v-for="entry in recommendations" :key="entry.item.id" class="recommend-item">
          <img :src="entry.item.image || fallbackImage" :alt="entry.item.name" />
          <p class="recommend-name">{{ entry.item.name }}</p>
          <p class="recommend-meta">
            คะแนน {{ entry.score }} · ซื้อคู่กัน {{ entry.coPurchaseCount }} ครั้ง
          </p>
          <p class="recommend-price">{{ entry.item.price.toLocaleString() }} บาท</p>
          <div class="recommend-actions">
            <button class="btn btn-sm btn-outline-warning" @click="addToCart(entry.item)">เพิ่มลงตะกร้า</button>
            <router-link class="btn btn-sm btn-outline-secondary" :to="`/products/${entry.item.id}`">
              ดูสินค้า
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <section class="recent-card" v-if="recentlyViewed.length > 0">
      <h2>ดูล่าสุด</h2>
      <div class="recent-list">
        <router-link
          v-for="item in recentlyViewed"
          :key="item.id"
          class="recent-chip"
          :to="`/products/${item.id}`"
        >
          {{ item.name }}
        </router-link>
      </div>
    </section>

    <p v-if="isLoading" class="state-text">กำลังโหลดรายละเอียดสินค้า...</p>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const recommendations = ref([])
const recentlyViewed = ref([])
const wishlistedIds = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const fallbackImage = '/src/assets/music.jpg'
const RECENT_VIEWED_KEY = 'recently_viewed_products'
const WISHLIST_KEY = 'wishlist_products'

const bundleCandidates = computed(() => recommendations.value.slice(0, 2).map((entry) => entry.item))
const bundleTotal = computed(() => {
  if (!product.value) {
    return 0
  }

  return [product.value, ...bundleCandidates.value].reduce((sum, item) => sum + Number(item.price || 0), 0)
})

const isWishlisted = (productId) => wishlistedIds.value.includes(productId)

const readJsonArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const loadWishlist = () => {
  wishlistedIds.value = readJsonArray(WISHLIST_KEY)
}

const toggleWishlist = (productId) => {
  const current = new Set(wishlistedIds.value)

  if (current.has(productId)) {
    current.delete(productId)
  } else {
    current.add(productId)
  }

  wishlistedIds.value = [...current]
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistedIds.value))
}

const saveRecentlyViewed = () => {
  if (!product.value) {
    return
  }

  const current = readJsonArray(RECENT_VIEWED_KEY).filter((item) => item?.id !== product.value.id)
  const next = [{ id: product.value.id, name: product.value.name }, ...current].slice(0, 8)
  localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(next))
  recentlyViewed.value = next.filter((item) => item.id !== product.value.id)
}

const loadRecommendations = async () => {
  if (!product.value?.id) {
    recommendations.value = []
    return
  }

  try {
    const response = await api.get(`/products/${product.value.id}/recommendations`, {
      params: { limit: 6 }
    })

    recommendations.value = response.data.recommendations || []
  } catch {
    recommendations.value = []
  }
}

const loadProduct = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get(`/products/${route.params.id}`)
    product.value = response.data.item
    saveRecentlyViewed()
    await loadRecommendations()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดรายละเอียดสินค้าไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

const addToCart = (item) => {
  cartStore.addToCart(item)
}

const addBundleToCart = () => {
  if (!product.value) {
    return
  }

  cartStore.addToCart(product.value)

  for (const item of bundleCandidates.value) {
    cartStore.addToCart(item)
  }
}

onMounted(async () => {
  loadWishlist()
  recentlyViewed.value = readJsonArray(RECENT_VIEWED_KEY)
  await loadProduct()
})

watch(() => route.params.id, async () => {
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

.bundle-box {
  margin-top: 16px;
  border: 1px dashed #f59e0b;
  border-radius: 12px;
  padding: 12px;
  background: #fff7ed;
}

.bundle-box h2 {
  margin: 0;
  font-size: 1.02rem;
}

.bundle-box p {
  margin: 6px 0 10px;
  color: #9a3412;
}

.recommend-card,
.recent-card {
  margin-top: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 16px;
}

.recommend-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.recommend-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
}

.recommend-item img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.recommend-name {
  margin: 8px 0 4px;
  font-weight: 700;
}

.recommend-meta {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.recommend-price {
  margin: 8px 0;
  color: #c2410c;
  font-weight: 800;
}

.recommend-actions {
  display: flex;
  gap: 8px;
}

.recent-card h2 {
  margin: 0;
  font-size: 1.05rem;
}

.recent-list {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.recent-chip {
  text-decoration: none;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 12px;
  color: var(--text-primary);
  background: var(--bg-surface-soft);
  font-weight: 600;
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
