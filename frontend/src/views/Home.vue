<template>
  <div class="home-page">
    <section class="hero market-surface">
      <div class="hero-copy">
        <p class="hero-tag">
          <i class="bi bi-lightning-charge-fill" aria-hidden="true"></i>
          ดีลเด่น
        </p>
        <h1>มาร์เก็ตเพลสเครื่องดนตรี MusicStore</h1>
        <p class="hero-desc">
          เครื่องดนตรีและอุปกรณ์เสริมสำหรับทุกระดับ ตั้งแต่มือใหม่ถึงมืออาชีพ พร้อมดีลใหม่ทุกสัปดาห์
        </p>

        <div class="hero-actions">
          <router-link to="/products" class="market-btn-primary cta-main">
            <i class="bi bi-bag-check me-1" aria-hidden="true"></i>
            เลือกซื้อสินค้า
          </router-link>
          <router-link :to="spotlightCategoryLink" class="cta-outline">
            <i class="bi bi-music-note-list me-1" aria-hidden="true"></i>
            ดู {{ spotlightCategoryLabel }} ทั้งหมด
          </router-link>
        </div>
      </div>

      <div class="hero-tiles">
        <article class="hero-tile market-card">
          <div class="tile-head">
            <i class="bi bi-lightning-charge-fill" aria-hidden="true"></i>
            <span class="tile-label">สินค้าพร้อมส่ง</span>
          </div>
          <h3>{{ totalCatalogCount.toLocaleString() }}+ รายการ</h3>
          <p>รวมดีลเครื่องดนตรีและอุปกรณ์เสริมที่คัดมาแล้ว</p>
        </article>
        <article class="hero-tile market-card">
          <div class="tile-head">
            <i class="bi bi-graph-up-arrow" aria-hidden="true"></i>
            <span class="tile-label">หมวดยอดฮิต</span>
          </div>
          <h3>{{ topCategories.length }} หมวดแนะนำ</h3>
          <p>นำโดย {{ topCategoryDisplay }} และหมวดขายดีอื่นๆ</p>
        </article>
      </div>
    </section>

    <section class="section-block market-surface">
      <header class="section-head">
        <h2>
          <i class="bi bi-grid-3x3-gap-fill" aria-hidden="true"></i>
          หมวดหมู่ยอดนิยม
        </h2>
      </header>

      <div class="section-state" v-if="isLoading">กำลังโหลดหมวดหมู่...</div>
      <div class="section-state text-danger" v-else-if="errorMessage">{{ errorMessage }}</div>

      <div class="category-grid" v-else-if="topCategories.length > 0">
        <router-link
          v-for="entry in topCategories"
          :key="entry.category"
          :to="`/category/${entry.category}`"
          class="category-card"
        >
          <img :src="entry.image || fallbackImage" :alt="entry.displayName" />
          <div class="category-label">{{ entry.displayName }} ({{ entry.count }})</div>
        </router-link>
      </div>

      <div class="section-state" v-else>ยังไม่มีข้อมูลหมวดหมู่</div>
    </section>

    <section class="section-block market-surface">
      <header class="section-head">
        <h2>
          <i class="bi bi-stars" aria-hidden="true"></i>
          สินค้าแนะนำ
        </h2>
      </header>

      <div class="featured-grid" v-if="featuredProducts.length > 0">
        <article class="featured-card market-card" v-for="product in featuredProducts" :key="product.id">
          <img :src="product.image || fallbackImage" :alt="product.name" />
          <h3>{{ product.name }}</h3>
          <p class="meta">{{ product.brand || product.category }}</p>
          <p class="price">{{ product.price.toLocaleString() }} บาท</p>
          <button class="market-btn-primary buy-btn" @click="addToCart(product)">
            <i class="bi bi-cart-plus me-1" aria-hidden="true"></i>
            เพิ่มลงตะกร้า
          </button>
        </article>
      </div>

      <div class="section-state" v-else-if="!isLoading">ยังไม่มีสินค้าแนะนำ</div>

      <router-link to="/products" class="view-all-link">
        ดูสินค้าทั้งหมด
        <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </router-link>
    </section>

    <section class="section-block market-surface">
      <header class="section-head">
        <h2>
          <i class="bi bi-fire" aria-hidden="true"></i>
          กำลังมาแรง
        </h2>
      </header>

      <div class="featured-grid" v-if="trendingProducts.length > 0">
        <article class="featured-card market-card" v-for="entry in trendingProducts" :key="entry.item.id">
          <img :src="entry.item.image || fallbackImage" :alt="entry.item.name" />
          <h3>{{ entry.item.name }}</h3>
          <p class="meta">ขายแล้ว {{ entry.soldCount }} ชิ้น</p>
          <p class="price">{{ entry.item.price.toLocaleString() }} บาท</p>
          <router-link class="cta-outline" :to="`/products/${entry.item.id}`">ดูรายละเอียด</router-link>
        </article>
      </div>
      <div class="section-state" v-else-if="!isLoading">ยังไม่มีข้อมูลสินค้ามาแรง</div>
    </section>

    <section class="section-block market-surface" v-if="wishlistPreview.length > 0">
      <header class="section-head">
        <h2>
          <i class="bi bi-heart-fill" aria-hidden="true"></i>
          รายการโปรดของคุณ
        </h2>
      </header>

      <div class="recent-list">
        <span class="recent-chip" v-for="id in wishlistPreview" :key="id">สินค้า #{{ id }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const isLoading = ref(false)
const errorMessage = ref('')
const featuredProducts = ref([])
const trendingProducts = ref([])
const topCategories = ref([])
const totalCatalogCount = ref(0)
const wishlistPreview = ref([])
const fallbackImage = '/src/assets/music.jpg'

const spotlightCategoryLink = computed(() => {
  if (topCategories.value.length === 0) {
    return '/products'
  }

  return `/category/${topCategories.value[0].category}`
})

const spotlightCategoryLabel = computed(() => {
  if (topCategories.value.length === 0) {
    return 'สินค้า'
  }

  return topCategories.value[0].displayName
})

const topCategoryDisplay = computed(() => {
  if (topCategories.value.length === 0) {
    return 'สินค้ายอดนิยม'
  }

  return topCategories.value[0].displayName
})

const fetchHomeData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [productsRes, categoriesRes, trendingRes] = await Promise.all([
      api.get('/products', {
        params: {
          page: 1,
          limit: 50,
          sort: 'default'
        }
      }),
      api.get('/products/categories'),
      api.get('/products/trending', {
        params: {
          limit: 6
        }
      })
    ])

    const allProducts = productsRes.data.items || []
    const categories = categoriesRes.data.categories || []

    const inStockProducts = allProducts.filter((item) => item.stock > 0)
    featuredProducts.value = (inStockProducts.length > 0 ? inStockProducts : allProducts).slice(0, 3)

    totalCatalogCount.value = categories.reduce((sum, item) => sum + item.count, 0)
    trendingProducts.value = trendingRes.data.products || []
    topCategories.value = categories
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((entry) => {
        const cover = allProducts.find((product) => product.category === entry.category)

        return {
          ...entry,
          image: cover?.image || fallbackImage
        }
      })
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดข้อมูลหน้าแรกไม่สำเร็จ'
    featuredProducts.value = []
    trendingProducts.value = []
    topCategories.value = []
    totalCatalogCount.value = 0
  } finally {
    isLoading.value = false
  }
}

const loadWishlistPreview = () => {
  try {
    const ids = JSON.parse(localStorage.getItem('wishlist_products') || '[]')
    wishlistPreview.value = Array.isArray(ids) ? ids.slice(0, 6) : []
  } catch {
    wishlistPreview.value = []
  }
}

const addToCart = (product) => {
  cartStore.addToCart(product)
}

onMounted(async () => {
  loadWishlistPreview()
  await fetchHomeData()
})
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 20px;
  padding: 20px;
  max-width: 1360px;
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
  padding: 22px;
  overflow: hidden;
  position: relative;
}

.hero::before {
  content: "";
  position: absolute;
  inset: -35% auto auto -25%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.22), transparent 72%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 6px 12px;
  border-radius: 999px;
  color: #9a3412;
  background: #ffedd5;
  font-weight: 700;
  font-size: 0.88rem;
}

h1 {
  margin: 14px 0 12px;
  font-size: clamp(1.8rem, 3.1vw, 2.6rem);
  line-height: 1.1;
}

.hero-desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 58ch;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.cta-main,
.cta-outline {
  text-decoration: none;
}

.cta-main {
  display: inline-flex;
  align-items: center;
}

.cta-outline {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-surface-soft);
  color: var(--text-primary);
  padding: 10px 16px;
  font-weight: 700;
}

.hero-tiles {
  display: grid;
  gap: 12px;
}

.hero-tile {
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.hero-tile::after {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  right: -35px;
  top: -35px;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent), transparent 72%), transparent 68%);
  pointer-events: none;
}

.tile-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hero-tile h3 {
  margin: 8px 0 6px;
}

.hero-tile p {
  margin: 0;
  color: var(--text-secondary);
}

.tile-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  font-weight: 700;
}

.section-block {
  padding: 20px;
}

.section-head h2 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
}

.category-grid,
.featured-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.category-card {
  display: block;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid var(--border);
  text-decoration: none;
}

.category-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.category-card:hover img {
  transform: scale(1.06);
}

.category-label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 700;
}

.featured-card {
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.featured-card img {
  width: 100%;
  height: 210px;
  object-fit: cover;
  border-radius: 10px;
}

.featured-card h3 {
  margin: 12px 0 6px;
  line-height: 1.25;
  min-height: 2.5em;
}

.meta {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.price {
  margin: 8px 0 0;
  color: #c2410c;
  font-weight: 800;
}

.buy-btn {
  margin-top: auto;
  margin-bottom: 2px;
  width: 100%;
}

.section-state {
  margin-top: 16px;
  color: var(--text-secondary);
}

.view-all-link {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c2410c;
  font-weight: 700;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  .hero-tag {
    background: rgba(245, 158, 11, 0.14);
    color: #fcd34d;
  }

  .category-label {
    background: rgba(2, 6, 23, 0.78);
  }

  .view-all-link {
    color: #f59e0b;
  }
}

@media (max-width: 992px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .category-grid,
  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-page {
    padding: 12px;
    gap: 12px;
  }

  .hero,
  .section-block {
    padding: 14px;
  }

  .category-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
