<template>
  <div class="admin-user-orders-page page-shell">
    <section class="orders-card">
      <header class="orders-head">
        <h1>
          <i class="bi bi-people" aria-hidden="true"></i>
          ประวัติการซื้อของสมาชิก #{{ userId }}
        </h1>
        <router-link to="/admin" class="btn btn-outline-secondary btn-sm">กลับหน้าแอดมิน</router-link>
      </header>

      <p v-if="isLoading" class="state-text">กำลังโหลดข้อมูล...</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div v-if="!isLoading && !errorMessage && orders.length === 0" class="empty-state">
        สมาชิกคนนี้ยังไม่มีประวัติการซื้อ
      </div>

      <div v-else-if="!isLoading && !errorMessage" class="list-wrap">
        <article v-for="order in orders" :key="order.id" class="order-row">
          <div>
            <p class="order-id">คำสั่งซื้อ #{{ order.id }}</p>
            <p class="order-meta">{{ formatDate(order.createdAt) }} · {{ order.itemCount }} รายการ</p>
          </div>

          <div class="order-right">
            <p class="order-total">{{ order.totalAmount.toLocaleString() }} บาท</p>
            <router-link
              :to="`/admin/orders/${order.id}?userId=${userId}`"
              class="btn btn-outline-secondary btn-sm"
            >
              ดูรายละเอียด
            </router-link>
          </div>
        </article>
      </div>
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

const isLoading = ref(false)
const errorMessage = ref('')
const orders = ref([])

const userId = computed(() => Number(route.params.userId))
const formatDate = (iso) => new Date(iso).toLocaleString('th-TH')

const loadOrders = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get(`/admin/users/${userId.value}/orders`, {
      headers: authStore.authHeaders()
    })

    orders.value = response.data.orders || []
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'โหลดประวัติการซื้อของสมาชิกไม่สำเร็จ'
  } finally {
    isLoading.value = false
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
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.orders-head h1 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
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
}

.order-total {
  margin: 0;
  font-weight: 700;
}

.state-text,
.error-text,
.empty-state {
  margin: 10px 0;
}

.error-text {
  color: #b91c1c;
}

@media (max-width: 720px) {
  .order-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
