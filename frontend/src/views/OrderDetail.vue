<template>
  <div class="order-detail-page page-shell">
    <section class="detail-card">
      <div class="head-row">
        <div>
          <h1>รายละเอียดคำสั่งซื้อ #{{ order?.id }}</h1>
          <p v-if="order">วันที่ {{ formatDate(order.createdAt) }}</p>
        </div>

        <router-link :to="backRoute" class="btn btn-outline-secondary btn-sm">
          กลับ
        </router-link>
      </div>

      <p v-if="isLoading" class="state-text">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <template v-if="order && !isLoading">
        <div v-if="isAdminView" class="customer-box">
          <p><strong>ลูกค้า:</strong> {{ order.customer.name }}</p>
          <p><strong>อีเมล:</strong> {{ order.customer.email }}</p>
        </div>

        <div class="status-line">
          <span class="status-badge">{{ mapStatus(order.status) }}</span>
          <span>รวม {{ order.totalAmount.toLocaleString() }} บาท</span>
        </div>

        <div class="journey-wrap" v-if="order.journey?.length">
          <h2>เส้นทางคำสั่งซื้อ</h2>
          <div class="journey-grid">
            <article
              v-for="step in order.journey"
              :key="step.key"
              class="journey-step"
              :class="{ completed: step.completed }"
            >
              <p class="journey-label">{{ step.label }}</p>
              <p class="journey-time">{{ step.timestamp ? formatDate(step.timestamp) : 'รอดำเนินการ' }}</p>
            </article>
          </div>
        </div>

        <div class="item-list">
          <article class="item-row" v-for="item in order.items" :key="`${order.id}-${item.productId}`">
            <div>
              <p class="item-name">{{ item.productName }}</p>
              <p class="item-meta">จำนวน {{ item.quantity }} ชิ้น</p>
            </div>

            <p class="item-price">{{ item.priceAtPurchase.toLocaleString() }} บาท</p>
          </article>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const order = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const orderId = computed(() => Number(route.params.orderId))
const isAdminView = computed(() => route.path.startsWith('/admin/orders/'))
const backRoute = computed(() => {
  if (isAdminView.value) {
    const userId = route.query.userId
    return userId ? `/admin/users/${userId}/orders` : '/admin'
  }

  return '/orders'
})

const mapStatus = (status) => {
  if (status === 'confirmed') {
    return 'ยืนยันแล้ว'
  }

  if (status === 'pending') {
    return 'รอดำเนินการ'
  }

  return status
}

const formatDate = (iso) => new Date(iso).toLocaleString('th-TH')

const loadOrder = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const endpoint = isAdminView.value
      ? `/admin/orders/${orderId.value}`
      : `/orders/${orderId.value}`

    const response = await api.get(endpoint, {
      headers: authStore.authHeaders()
    })

    order.value = response.data.order
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดรายละเอียดคำสั่งซื้อไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (isAdminView.value && authStore.user?.role !== 'admin') {
    router.push('/')
    return
  }

  await loadOrder()
})
</script>

<style scoped>
.detail-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 20px;
}

.head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.head-row h1 {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
}

.head-row p {
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.status-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 600;
}

.journey-wrap {
  margin-bottom: 14px;
}

.journey-wrap h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.journey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
}

.journey-step {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  background: var(--bg-surface-soft);
}

.journey-step.completed {
  border-color: #16a34a;
  background: #dcfce7;
}

.journey-label {
  margin: 0;
  font-weight: 700;
}

.journey-time {
  margin: 5px 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.status-badge {
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.82rem;
  font-weight: 700;
}

.customer-box {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.customer-box p {
  margin: 0 0 4px;
}

.item-list {
  display: grid;
  gap: 10px;
}

.item-row {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.item-name {
  margin: 0;
  font-weight: 700;
}

.item-meta {
  margin: 4px 0 0;
  color: var(--text-secondary);
}

.item-price {
  margin: 0;
  font-weight: 700;
}

.state-text,
.error-text {
  margin: 10px 0;
}

.error-text {
  color: #b91c1c;
}

@media (max-width: 680px) {
  .item-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
