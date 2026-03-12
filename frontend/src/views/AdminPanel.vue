<template>
  <div class="admin-page">
    <div class="panel">
      <h1>Admin Panel</h1>

      <section class="section">
        <h2>จัดการสินค้า</h2>
        <div class="form-grid">
          <div class="field">
            <label>ชื่อสินค้า</label>
            <input v-model="productForm.name" type="text" placeholder="เช่น Fender Stratocaster" />
          </div>

          <div class="field">
            <label>แบรนด์</label>
            <input v-model="productForm.brand" type="text" placeholder="เช่น Fender" />
          </div>

          <div class="field">
            <label>หมวดหมู่</label>
            <input v-model="productForm.category" type="text" placeholder="เช่น guitar" />
          </div>

          <div class="field">
            <label>ประเภทสินค้า</label>
            <select v-model="productForm.type">
              <option value="instrument">instrument</option>
              <option value="accessory">accessory</option>
            </select>
          </div>

          <div class="field">
            <label>ราคา</label>
            <input v-model.number="productForm.price" type="number" min="0" placeholder="เช่น 12900" />
          </div>

          <div class="field">
            <label>สต็อก</label>
            <input v-model.number="productForm.stock" type="number" min="0" placeholder="เช่น 20" />
          </div>

          <div class="field wide">
            <label>URL รูปภาพ</label>
            <input v-model="productForm.image" type="text" placeholder="https://..." />
          </div>
        </div>

        <button class="primary" :disabled="isSubmittingProduct" @click="createProduct">
          {{ isSubmittingProduct ? 'กำลังบันทึก...' : 'เพิ่มสินค้า' }}
        </button>
        <p v-if="productMessage" class="message">{{ productMessage }}</p>

        <div class="table-wrap">
          <table>
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
                <td>{{ item.type }}</td>
                <td>{{ item.price }}</td>
                <td>{{ item.stock }}</td>
                <td class="actions">
                  <button @click="editProduct(item)">แก้ไข</button>
                  <button class="danger" @click="deleteProduct(item.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <h2>จัดการผู้ใช้</h2>
        <p v-if="userMessage" class="message">{{ userMessage }}</p>
        <div class="table-wrap">
          <table>
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
                  <input v-model="userDrafts[user.id].name" type="text" />
                </td>
                <td>
                  <input v-model="userDrafts[user.id].email" type="email" />
                </td>
                <td>
                  <select v-model="userDrafts[user.id].role" :disabled="user.id === authStore.user?.id">
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td class="actions">
                  <button @click="saveUser(user.id)">บันทึก</button>
                  <button
                    class="danger"
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
  padding: 18px;
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
select,
button {
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
}

.primary {
  background: #ffc107;
  font-weight: bold;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  margin-top: 10px;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: 10px;
  text-align: left;
}

.actions {
  display: flex;
  gap: 6px;
}

button.danger {
  background: #e53935;
  color: white;
}
</style>
