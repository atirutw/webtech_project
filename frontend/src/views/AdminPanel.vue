<template>
  <div class="admin-page">
    <div class="panel">
      <h1 class="h3 mb-3">Admin Panel</h1>

      <section class="section">
        <h2 class="h5 mb-3">จัดการสินค้า</h2>
        <div class="form-grid">
          <div class="field">
            <label>ชื่อสินค้า</label>
            <input v-model="productForm.name" class="form-control" type="text" placeholder="เช่น Fender Stratocaster" />
          </div>

          <div class="field">
            <label>แบรนด์</label>
            <input v-model="productForm.brand" class="form-control" type="text" placeholder="เช่น Fender" />
          </div>

          <div class="field">
            <label>หมวดหมู่</label>
            <input v-model="productForm.category" class="form-control" type="text" placeholder="เช่น guitar" />
          </div>

          <div class="field">
            <label>ประเภทสินค้า</label>
            <select v-model="productForm.type" class="form-select">
              <option value="instrument">instrument</option>
              <option value="accessory">accessory</option>
            </select>
          </div>

          <div class="field">
            <label>ราคา</label>
            <input v-model.number="productForm.price" class="form-control" type="number" min="0" placeholder="เช่น 12900" />
          </div>

          <div class="field">
            <label>สต็อก</label>
            <input v-model.number="productForm.stock" class="form-control" type="number" min="0" placeholder="เช่น 20" />
          </div>

          <div class="field wide">
            <label>URL รูปภาพ</label>
            <input v-model="productForm.image" class="form-control" type="text" placeholder="https://..." />
          </div>
        </div>

        <button class="btn btn-warning fw-semibold" :disabled="isSubmittingProduct" @click="createProduct">
          <span v-if="isSubmittingProduct" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSubmittingProduct ? 'กำลังบันทึก...' : 'เพิ่มสินค้า' }}
        </button>
        <div v-if="productMessage" class="alert mt-3 mb-0 py-2" :class="productMessage.includes('ไม่สำเร็จ') ? 'alert-danger' : 'alert-success'">
          {{ productMessage }}
        </div>

        <div class="table-wrap">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>สินค้า</th>
                <th>ประเภท</th>
                <th>ราคา</th>
                <th>สต็อก</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in products" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <span class="badge" :class="item.type === 'instrument' ? 'text-bg-primary' : 'text-bg-info'">
                    {{ item.type }}
                  </span>
                </td>
                <td>{{ item.price }}</td>
                <td>{{ item.stock }}</td>
                <td class="actions">
                  <button class="btn btn-outline-warning btn-sm" @click="editProduct(item)">แก้ไข</button>
                  <button class="btn btn-outline-danger btn-sm" @click="deleteProduct(item.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <h2 class="h5 mb-3">จัดการผู้ใช้</h2>
        <div v-if="userMessage" class="alert mb-3 py-2" :class="userMessage.includes('ไม่สำเร็จ') ? 'alert-danger' : 'alert-success'">
          {{ userMessage }}
        </div>
        <div class="table-wrap">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>Role</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  <input v-model="userDrafts[user.id].name" class="form-control form-control-sm" type="text" />
                </td>
                <td>
                  <input v-model="userDrafts[user.id].email" class="form-control form-control-sm" type="email" />
                </td>
                <td>
                  <select v-model="userDrafts[user.id].role" class="form-select form-select-sm" :disabled="user.id === authStore.user?.id">
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td class="actions">
                  <button class="btn btn-outline-success btn-sm" @click="saveUser(user.id)">บันทึก</button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    :disabled="user.id === authStore.user?.id"
                    @click="deleteUser(user.id)">
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const products = ref([])
const users = ref([])
const userDrafts = ref({})

const isSubmittingProduct = ref(false)
const productMessage = ref('')
const userMessage = ref('')

const productForm = ref({
  name: '',
  brand: '',
  category: '',
  type: 'instrument',
  price: '',
  stock: '',
  image: ''
})

const adminHeaders = () => ({
  headers: authStore.authHeaders()
})

const buildUserDrafts = (list) => {
  const drafts = {}

  for (const user of list) {
    drafts[user.id] = {
      name: user.name,
      email: user.email,
      role: user.role
    }
  }

  userDrafts.value = drafts
}

const fetchProducts = async () => {
  const response = await api.get('/products', {
    params: {
      page: 1,
      limit: 50,
      sort: 'default'
    }
  })

  products.value = response.data.items || []
}

const fetchUsers = async () => {
  const response = await api.get('/admin/users', adminHeaders())
  users.value = response.data.users || []
  buildUserDrafts(users.value)
}

const createProduct = async () => {
  productMessage.value = ''
  isSubmittingProduct.value = true

  try {
    await api.post('/products', productForm.value, adminHeaders())

    productForm.value = {
      name: '',
      brand: '',
      category: '',
      type: 'instrument',
      price: '',
      stock: '',
      image: ''
    }

    productMessage.value = 'เพิ่มสินค้าสำเร็จ'
    await fetchProducts()
  } catch (error) {
    productMessage.value = error?.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ'
  } finally {
    isSubmittingProduct.value = false
  }
}

const editProduct = async (product) => {
  const name = window.prompt('ชื่อสินค้า', product.name)
  if (name === null) return

  const category = window.prompt('หมวดหมู่', product.category)
  if (category === null) return

  const type = window.prompt('ประเภทสินค้า (instrument/accessory)', product.type)
  if (type === null) return

  const priceInput = window.prompt('ราคา', String(product.price))
  if (priceInput === null) return

  const stockInput = window.prompt('สต็อก', String(product.stock))
  if (stockInput === null) return

  const brand = window.prompt('แบรนด์', product.brand || '')
  if (brand === null) return

  const image = window.prompt('URL รูปภาพ', product.image || '')
  if (image === null) return

  try {
    await api.patch(`/products/${product.id}`, {
      name,
      category,
      type,
      price: Number(priceInput),
      stock: Number(stockInput),
      brand,
      image
    }, adminHeaders())

    productMessage.value = 'แก้ไขสินค้าสำเร็จ'
    await fetchProducts()
  } catch (error) {
    productMessage.value = error?.response?.data?.message || 'แก้ไขสินค้าไม่สำเร็จ'
  }
}

const deleteProduct = async (id) => {
  if (!window.confirm('ต้องการลบสินค้านี้หรือไม่?')) return

  try {
    await api.delete(`/products/${id}`, adminHeaders())
    productMessage.value = 'ลบสินค้าสำเร็จ'
    await fetchProducts()
  } catch (error) {
    productMessage.value = error?.response?.data?.message || 'ลบสินค้าไม่สำเร็จ'
  }
}

const saveUser = async (id) => {
  userMessage.value = ''

  try {
    await api.patch(`/admin/users/${id}`, userDrafts.value[id], adminHeaders())
    userMessage.value = 'บันทึกข้อมูลผู้ใช้สำเร็จ'
    await fetchUsers()
  } catch (error) {
    userMessage.value = error?.response?.data?.message || 'บันทึกข้อมูลผู้ใช้ไม่สำเร็จ'
  }
}

const deleteUser = async (id) => {
  if (!window.confirm('ต้องการลบผู้ใช้นี้หรือไม่?')) return

  try {
    await api.delete(`/admin/users/${id}`, adminHeaders())
    userMessage.value = 'ลบผู้ใช้สำเร็จ'
    await fetchUsers()
  } catch (error) {
    userMessage.value = error?.response?.data?.message || 'ลบผู้ใช้ไม่สำเร็จ'
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (authStore.user?.role !== 'admin') {
    router.push('/')
    return
  }

  await Promise.all([fetchProducts(), fetchUsers()])
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 90px 24px 24px;
}

.panel {
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

.section {
  margin-top: 24px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.65);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

.wide {
  grid-column: 1 / -1;
}

input,
select {
  border-radius: 8px;
}

button {
  border-radius: 8px;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 14px;
}

.actions {
  display: flex;
  gap: 6px;
}
</style>
