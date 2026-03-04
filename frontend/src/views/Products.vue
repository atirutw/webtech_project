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
          ทั้งหมด ({{ products.length }})
        </li>

        <li
          v-for="cat in categories"
          :key="cat"
          :class="{ active: selectedCategory === cat }"
          @click="goCategory(cat)"
        >
          {{ cat }} ({{ categoryCount(cat) }})
        </li>
      </ul>
    </aside>

    <!-- CONTENT -->
    <div class="content">

      <h1>🎸 สินค้า</h1>

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

      </div>

      <!-- PRODUCT GRID -->
      <div class="grid">
        <div
          class="card"
          v-for="product in paginatedProducts"
          :key="product.id"
        >
          <img :src="product.image" />
          <h3>{{ product.name }}</h3>
          <p class="brand">{{ product.brand }}</p>
          <p class="price">{{ product.price.toLocaleString() }} บาท</p>

          <button class="cart-btn" @click="addToCart(product)">
            เพิ่มลงตะกร้า 🛒
          </button>
        </div>
      </div>

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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const products = ref([
  { id: 1, name: 'Fender Stratocaster', brand: 'Fender', price: 25000, category: 'guitar', image: '/src/assets/guitar/Fender.jpg' },
  { id: 2, name: 'Gibson Les Paul', brand: 'Gibson', price: 45000, category: 'guitar', image: '/src/assets/guitar/Gibson.jpg' },
  { id: 3, name: 'Yamaha Acoustic', brand: 'Yamaha', price: 12000, category: 'guitar', image: '/src/assets/guitar/Acoustic1.jpg' },
  { id: 4, name: 'Hofner Violin', brand: 'Hofner', price: 23000, category: 'violin', image: '/src/assets/violin/violin2.jpg' },
  { id: 5, name: 'Coleman Sax', brand: 'Coleman', price: 18000, category: 'saxophone', image: '/src/assets/sax/Saxophone Coleman CL-334S.jpg' },
  { id: 6, name: 'Pro Violin', brand: 'Hofner', price: 30000, category: 'violin', image: '/src/assets/violin/violin3.jpg' },
  { id: 7, name: 'Coleman Silver Tenor Sax', brand: 'Coleman', price: 30000, category: 'saxophone', image: '/src/assets/sax/Coleman Standard Silver Tenor Saxophone.jpg'},
  { id: 8, name: 'Coleman CST-200L Tenor Saxophone', brand: 'Coleman', price: 20000, category: 'saxophone', image: '/src/assets/sax/Coleman CST-200L Tenor Saxophone.jpg' },
  { id: 9, name: 'Hofner Violin H3', brand: 'Hofner', price: 21000, category: 'violin', image: '/src/assets/violin/violin4.jpg' }
])

/* ================= CATEGORY ================= */

const categories = computed(() =>
  [...new Set(products.value.map(p => p.category))]
)

const categoryCount = (cat) =>
  products.value.filter(p => p.category === cat).length

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

/* ================= FILTER ================= */

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (searchText.value) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  if (sortOption.value === 'lowToHigh') {
    result.sort((a, b) => a.price - b.price)
  }

  if (sortOption.value === 'highToLow') {
    result.sort((a, b) => b.price - a.price)
  }

  return result
})

/* ================= PAGINATION ================= */

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage)
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const goToPage = (page) => {
  currentPage.value = page
}

watch(filteredProducts, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
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