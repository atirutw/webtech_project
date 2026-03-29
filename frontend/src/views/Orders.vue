<template>
  <div class="orders-page page-shell">
    <section class="orders-card">
      <header class="orders-head">
        <h1>
          <i class="bi bi-receipt-cutoff" aria-hidden="true"></i>
          ประวัติการสั่งซื้อ
        </h1>
        <p>รายการสั่งซื้อทั้งหมดของคุณ</p>
      </header>

      <p v-if="isLoading" class="state-text">กำลังโหลดประวัติการสั่งซื้อ...</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="reorderMessage" class="success-text">{{ reorderMessage }}</p>

      <div v-if="!isLoading && !errorMessage && orders.length === 0" class="empty-state">
        <p>ยังไม่มีประวัติการสั่งซื้อ</p>
        <router-link to="/products" class="market-btn-primary">เลือกซื้อสินค้า</router-link>
      </div>

      <div v-else-if="!isLoading && !errorMessage" class="list-wrap">
        <article v-for="order in orders" :key="order.id" class="order-row">
          <div>
            <p class="order-id">ออเดอร์ #{{ order.id }}</p>
            <p class="order-meta">
              {{ formatDate(order.createdAt) }} · {{ order.itemCount }} รายการ
            </p>
          </div>

          <div class="order-right">
            <p class="order-total">{{ order.totalAmount.toLocaleString() }} บาท</p>
            <span class="status-badge">{{ mapStatus(order.status) }}</span>
            <button class="btn btn-outline-warning btn-sm" @click="reorder(order.id)">
              สั่งซ้ำ
            </button>
            <router-link :to="`/orders/${order.id}`" class="btn btn-outline-secondary btn-sm">
              ดูรายละเอียด
            </router-link>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const authStore = useAuthStore()
const router = useRouter()
const cartStore = useCartStore()

const isLoading = ref(false)
const errorMessage = ref('')
const orders = ref([])
const reorderMessage = ref('')

const mapStatus = (status) => {
  if (status === 'confirmed') {
    return 'ยืนยันแล้ว'
  }

  if (status === 'pending') {
    return 'รอดำเนินการ'
  }

  return status
}

const formatDate = (iso) => {
  return new Date(iso).toLocaleString('th-TH')
}

const loadOrders = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/orders', {
      headers: authStore.authHeaders()
    })

    orders.value = response.data.orders || []
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดประวัติการสั่งซื้อไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

const reorder = async (orderId) => {
  reorderMessage.value = ''
  const payload = await cartStore.reorder(orderId)

  if (payload) {
    reorderMessage.value = `สั่งซ้ำจากออเดอร์ #${orderId} สำเร็จ`
    router.push('/cart')
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await loadOrders()
})
</script>

<style scoped>
.orders-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 20px;
}

.orders-head {
  margin-bottom: 16px;
}

.orders-head h1 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.3rem, 2vw, 1.8rem);
}

.orders-head p {
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.list-wrap {
  display: grid;
  gap: 10px;
}

.order-row {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.order-id {
  margin: 0;
  font-weight: 700;
}

.order-meta {
  margin: 4px 0 0;
  color: var(--text-secondary);
}

.order-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.order-total {
  margin: 0;
  font-weight: 700;
}

.status-badge {
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.82rem;
  font-weight: 700;
}

.state-text,
.error-text {
  margin: 10px 0;
}

.success-text {
  margin: 10px 0;
  color: #166534;
}

.error-text {
  color: #b91c1c;
}

.empty-state {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

@media (max-width: 720px) {
  .order-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-right {
    justify-content: flex-start;
  }
}
</style>
