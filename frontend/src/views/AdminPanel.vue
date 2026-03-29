<template>
  <div class="admin-page">
    <div class="panel">
      <AdminSidebar
        :active-section="activeSection"
        :product-count="products.length"
        :user-count="users.length"
        @change-section="activeSection = $event" />

      <main class="admin-content">
        <section v-show="activeSection === 'dashboard'" class="section">
          <div v-if="dashboardLoading" class="state-text">กำลังโหลดข้อมูล Command Center...</div>
          <div v-else-if="dashboardError" class="state-error">
            {{ dashboardError }}
            <button class="btn btn-outline-warning btn-sm ms-2" @click="fetchDashboard">ลองใหม่</button>
          </div>
          <AdminDashboardSection
            v-else-if="dashboard"
            :dashboard="dashboard"
            :days="dashboardDays" />
          <div v-else class="state-text">ยังไม่มีข้อมูล Command Center</div>
        </section>

        <ProductManagementSection
          v-show="activeSection === 'products'"
          :product-search="productSearch"
          :product-type-filter="productTypeFilter"
          :product-form="productForm"
          :is-submitting-product="isSubmittingProduct"
          :product-message="productMessage"
          :filtered-products="filteredProducts"
          @update-product-search="productSearch = $event"
          @update-product-type-filter="productTypeFilter = $event"
          @create-product="createProduct"
          @open-edit-product="openEditProduct"
          @request-delete-product="requestDeleteProduct" />

        <UserManagementSection
          v-show="activeSection === 'users'"
          :user-search="userSearch"
          :user-message="userMessage"
          :filtered-users="filteredUsers"
          :user-drafts="userDrafts"
          :current-user-id="authStore.user?.id || null"
          @update-user-search="userSearch = $event"
          @save-user="saveUser"
          @request-delete-user="requestDeleteUser" />
      </main>
    </div>

    <EditProductModal
      :open="isEditModalOpen"
      :edit-form="editForm"
      :is-saving-edit="isSavingEdit"
      @close="closeEditModal"
      @save="saveEditedProduct" />

    <DeleteConfirmModal
      :open="deleteDialog.open"
      :message="deleteDialog.message"
      :is-deleting="isDeleting"
      @close="closeDeleteDialog"
      @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminDashboardSection from '../components/admin/AdminDashboardSection.vue'
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal.vue'
import EditProductModal from '../components/admin/EditProductModal.vue'
import ProductManagementSection from '../components/admin/ProductManagementSection.vue'
import UserManagementSection from '../components/admin/UserManagementSection.vue'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const products = ref([])
const users = ref([])
const userDrafts = ref({})
const dashboard = ref(null)
const dashboardDays = ref(7)
const dashboardLoading = ref(false)
const dashboardError = ref('')

const isSubmittingProduct = ref(false)
const isSavingEdit = ref(false)
const isDeleting = ref(false)
const productMessage = ref('')
const userMessage = ref('')
const activeSection = ref('dashboard')

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

const fetchDashboard = async () => {
  dashboardLoading.value = true
  dashboardError.value = ''

  try {
    const response = await api.get('/admin/dashboard', {
      ...adminHeaders(),
      params: {
        days: dashboardDays.value
      }
    })

    dashboard.value = response.data.dashboard
  } catch (error) {
    dashboard.value = null
    dashboardError.value = error?.response?.data?.message || 'โหลดข้อมูล Command Center ไม่สำเร็จ'
    activeSection.value = 'products'
  } finally {
    dashboardLoading.value = false
  }
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

  await Promise.all([fetchProducts(), fetchUsers(), fetchDashboard()])
})
</script>

<style>
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

.state-text {
  color: var(--text-secondary);
}

.state-error {
  color: #b91c1c;
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
