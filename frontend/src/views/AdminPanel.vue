<template>
  <div class="admin-page">
    <div class="panel">
      <aside class="admin-sidebar">
        <h1 class="h4 mb-2">Admin Panel</h1>
        <p class="sidebar-subtitle">เลือกหมวดการจัดการ</p>

        <div class="sidebar-nav" role="tablist" aria-label="Admin categories">
          <button
            class="sidebar-item"
            :class="{ active: activeSection === 'products' }"
            @click="activeSection = 'products'">
            <span class="sidebar-item-title">จัดการสินค้า</span>
            <span class="sidebar-item-meta">{{ products.length }} รายการ</span>
          </button>

          <button
            class="sidebar-item"
            :class="{ active: activeSection === 'users' }"
            @click="activeSection = 'users'">
            <span class="sidebar-item-title">จัดการผู้ใช้</span>
            <span class="sidebar-item-meta">{{ users.length }} บัญชี</span>
          </button>
        </div>
      </aside>

      <main class="admin-content">
        <section v-show="activeSection === 'products'" class="section">
          <div class="section-head">
            <h2 class="h5 mb-0">จัดการสินค้า</h2>
          </div>

          <div class="toolbar">
            <input
              v-model.trim="productSearch"
              class="form-control"
              type="text"
              placeholder="ค้นหาสินค้า/แบรนด์/หมวดหมู่" />
            <select v-model="productTypeFilter" class="form-select toolbar-select">
              <option value="all">ทุกประเภท</option>
              <option value="instrument">instrument</option>
              <option value="accessory">accessory</option>
            </select>
          </div>

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
                <tr v-for="item in filteredProducts" :key="item.id">
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
                    <button class="btn btn-outline-warning btn-sm" @click="openEditProduct(item)">แก้ไข</button>
                    <button class="btn btn-outline-danger btn-sm" @click="requestDeleteProduct(item)">ลบ</button>
                  </td>
                </tr>
                <tr v-if="filteredProducts.length === 0">
                  <td colspan="6" class="empty-row">ไม่พบสินค้าที่ตรงเงื่อนไข</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-show="activeSection === 'users'" class="section">
          <div class="section-head">
            <h2 class="h5 mb-0">จัดการผู้ใช้</h2>
          </div>

          <div class="toolbar">
            <input
              v-model.trim="userSearch"
              class="form-control"
              type="text"
              placeholder="ค้นหาผู้ใช้ด้วยชื่อหรืออีเมล" />
          </div>

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
                <tr v-for="user in filteredUsers" :key="user.id">
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
                    <router-link :to="`/admin/users/${user.id}/orders`" class="btn btn-outline-info btn-sm">
                      ประวัติการซื้อ
                    </router-link>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      :disabled="user.id === authStore.user?.id"
                      @click="requestDeleteUser(user)">
                      ลบ
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="5" class="empty-row">ไม่พบผู้ใช้ที่ตรงเงื่อนไข</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <div v-if="isEditModalOpen" class="overlay" @click.self="closeEditModal">
      <div class="modal-card">
        <h3 class="h5 mb-3">แก้ไขสินค้า #{{ editForm.id }}</h3>

        <div class="form-grid modal-form-grid">
          <div class="field">
            <label>ชื่อสินค้า</label>
            <input v-model="editForm.name" class="form-control" type="text" />
          </div>

          <div class="field">
            <label>แบรนด์</label>
            <input v-model="editForm.brand" class="form-control" type="text" />
          </div>

          <div class="field">
            <label>หมวดหมู่</label>
            <input v-model="editForm.category" class="form-control" type="text" />
          </div>

          <div class="field">
            <label>ประเภทสินค้า</label>
            <select v-model="editForm.type" class="form-select">
              <option value="instrument">instrument</option>
              <option value="accessory">accessory</option>
            </select>
          </div>

          <div class="field">
            <label>ราคา</label>
            <input v-model.number="editForm.price" class="form-control" type="number" min="0" />
          </div>

          <div class="field">
            <label>สต็อก</label>
            <input v-model.number="editForm.stock" class="form-control" type="number" min="0" />
          </div>

          <div class="field wide">
            <label>URL รูปภาพ</label>
            <input v-model="editForm.image" class="form-control" type="text" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-light" :disabled="isSavingEdit" @click="closeEditModal">ยกเลิก</button>
          <button class="btn btn-warning fw-semibold" :disabled="isSavingEdit" @click="saveEditedProduct">
            <span v-if="isSavingEdit" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isSavingEdit ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteDialog.open" class="overlay" @click.self="closeDeleteDialog">
      <div class="modal-card confirm-card">
        <h3 class="h5 mb-2">ยืนยันการลบ</h3>
        <p class="confirm-text mb-3">{{ deleteDialog.message }}</p>
        <div class="modal-actions">
          <button class="btn btn-light" :disabled="isDeleting" @click="closeDeleteDialog">ยกเลิก</button>
          <button class="btn btn-danger" :disabled="isDeleting" @click="confirmDelete">
            <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const products = ref([])
const users = ref([])
const userDrafts = ref({})

const isSubmittingProduct = ref(false)
const isSavingEdit = ref(false)
const isDeleting = ref(false)
const productMessage = ref('')
const userMessage = ref('')
const activeSection = ref('products')

const productSearch = ref('')
const productTypeFilter = ref('all')
const userSearch = ref('')

const isEditModalOpen = ref(false)
const editForm = ref({
  id: null,
  name: '',
  brand: '',
  category: '',
  type: 'instrument',
  price: 0,
  stock: 0,
  image: ''
})

const deleteDialog = ref({
  open: false,
  type: '',
  id: null,
  message: ''
})

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

const filteredProducts = computed(() => {
  const keyword = productSearch.value.trim().toLowerCase()

  return products.value.filter((item) => {
    const matchesType = productTypeFilter.value === 'all' || item.type === productTypeFilter.value

    if (!keyword) {
      return matchesType
    }

    const text = `${item.name} ${item.brand || ''} ${item.category || ''}`.toLowerCase()
    return matchesType && text.includes(keyword)
  })
})

const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase()

  if (!keyword) {
    return users.value
  }

  return users.value.filter((user) => {
    const text = `${user.name || ''} ${user.email || ''}`.toLowerCase()
    return text.includes(keyword)
  })
})

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

const openEditProduct = (product) => {
  editForm.value = {
    id: product.id,
    name: product.name,
    brand: product.brand || '',
    category: product.category,
    type: product.type,
    price: product.price,
    stock: product.stock,
    image: product.image || ''
  }

  isEditModalOpen.value = true
}

const closeEditModal = () => {
  if (isSavingEdit.value) return
  isEditModalOpen.value = false
}

const saveEditedProduct = async () => {
  if (!editForm.value.id) return

  isSavingEdit.value = true

  try {
    await api.patch(`/products/${editForm.value.id}`, {
      name: editForm.value.name,
      category: editForm.value.category,
      type: editForm.value.type,
      price: Number(editForm.value.price),
      stock: Number(editForm.value.stock),
      brand: editForm.value.brand,
      image: editForm.value.image
    }, adminHeaders())

    productMessage.value = 'แก้ไขสินค้าสำเร็จ'
    isEditModalOpen.value = false
    await fetchProducts()
  } catch (error) {
    productMessage.value = error?.response?.data?.message || 'แก้ไขสินค้าไม่สำเร็จ'
  } finally {
    isSavingEdit.value = false
  }
}

const requestDeleteProduct = (product) => {
  deleteDialog.value = {
    open: true,
    type: 'product',
    id: product.id,
    message: `คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`
  }
}

const requestDeleteUser = (user) => {
  if (user.id === authStore.user?.id) return

  deleteDialog.value = {
    open: true,
    type: 'user',
    id: user.id,
    message: `คุณต้องการลบผู้ใช้ "${user.email}" ใช่หรือไม่?`
  }
}

const closeDeleteDialog = (force = false) => {
  if (isDeleting.value && !force) return

  deleteDialog.value = {
    open: false,
    type: '',
    id: null,
    message: ''
  }
}

const confirmDelete = async () => {
  if (!deleteDialog.value.id || !deleteDialog.value.type) return

  isDeleting.value = true

  try {
    if (deleteDialog.value.type === 'product') {
      await api.delete(`/products/${deleteDialog.value.id}`, adminHeaders())
      productMessage.value = 'ลบสินค้าสำเร็จ'
      await fetchProducts()
    }

    if (deleteDialog.value.type === 'user') {
      await api.delete(`/admin/users/${deleteDialog.value.id}`, adminHeaders())
      userMessage.value = 'ลบผู้ใช้สำเร็จ'
      await fetchUsers()
    }

    closeDeleteDialog(true)
  } catch (error) {
    if (deleteDialog.value.type === 'product') {
      productMessage.value = error?.response?.data?.message || 'ลบสินค้าไม่สำเร็จ'
    }

    if (deleteDialog.value.type === 'user') {
      userMessage.value = error?.response?.data?.message || 'ลบผู้ใช้ไม่สำเร็จ'
    }
  } finally {
    isDeleting.value = false
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
  max-width: 1280px;
  margin: 0 auto;
  color: var(--text-primary);
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 20px;
}

.admin-sidebar {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 108px;
}

.sidebar-subtitle {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--text-secondary);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-item {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-surface-soft);
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.sidebar-item:hover {
  transform: translateY(-1px);
  border-color: #fbbf24;
}

.sidebar-item.active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.12));
  border-color: #f59e0b;
}

.sidebar-item-title {
  font-weight: 700;
}

.sidebar-item-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.admin-content {
  min-width: 0;
}

.section {
  padding: 20px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.section-head {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.toolbar-select {
  width: 220px;
  flex: 0 0 220px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.modal-form-grid {
  margin-bottom: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
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

.empty-row {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 1000;
}

.modal-card {
  width: min(820px, 100%);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 20px;
}

.confirm-card {
  width: min(460px, 100%);
}

.confirm-text {
  color: var(--text-secondary);
}

.modal-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 992px) {
  .admin-page {
    padding: 84px 16px 16px;
  }

  .panel {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: static;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-item {
    flex: 1 1 200px;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .toolbar-select {
    width: 100%;
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-wrap: wrap;
  }

  .modal-actions {
    justify-content: stretch;
  }

  .modal-actions .btn {
    flex: 1;
  }
}
</style>
