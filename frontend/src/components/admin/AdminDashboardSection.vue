<template>
  <section class="section">
    <div class="section-head">
      <h2 class="h5 mb-0">ศูนย์ควบคุม</h2>
    </div>

    <div class="kpi-grid">
      <article class="kpi-card">
        <p class="kpi-label">ยอดขายรวม</p>
        <p class="kpi-value">{{ dashboard.kpis.totalRevenue.toLocaleString() }} ฿</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">จำนวนคำสั่งซื้อ</p>
        <p class="kpi-value">{{ dashboard.kpis.ordersCount.toLocaleString() }}</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">มูลค่าเฉลี่ยต่อคำสั่งซื้อ</p>
        <p class="kpi-value">{{ dashboard.kpis.averageOrderValue.toLocaleString() }} ฿</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">ลูกค้า</p>
        <p class="kpi-value">{{ dashboard.kpis.customersCount.toLocaleString() }}</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">ตะกร้าที่ยังไม่ยืนยัน</p>
        <p class="kpi-value">{{ dashboard.kpis.openCarts.toLocaleString() }}</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">สินค้าใกล้หมด</p>
        <p class="kpi-value">{{ dashboard.kpis.lowStockProducts.toLocaleString() }}</p>
      </article>
    </div>

    <div class="analytics-grid">
      <article class="analytics-card">
        <h3>ยอดขาย {{ days }} วันล่าสุด</h3>
        <div class="spark-grid">
          <div v-for="entry in dashboard.salesByDay" :key="entry.day" class="spark-item">
            <div class="spark-bar" :style="{ height: `${barHeight(entry.revenue)}%` }"></div>
            <p>{{ shortDate(entry.day) }}</p>
          </div>
        </div>
      </article>

      <article class="analytics-card">
        <h3>สินค้าขายดี</h3>
        <ul class="mini-list">
          <li v-for="product in dashboard.topProducts" :key="product.productId">
            <span>{{ product.name }}</span>
            <span>{{ product.soldCount }} ชิ้น</span>
          </li>
        </ul>
      </article>

      <article class="analytics-card">
        <h3>คำสั่งซื้อล่าสุด</h3>
        <ul class="mini-list">
          <li v-for="order in dashboard.recentOrders" :key="order.id">
            <span>#{{ order.id }} {{ order.customerName }}</span>
            <span>{{ order.totalAmount.toLocaleString() }} ฿</span>
          </li>
        </ul>
      </article>

      <article class="analytics-card">
        <h3>สินค้าใกล้หมดสต็อก</h3>
        <ul class="mini-list">
          <li v-for="entry in dashboard.lowStock" :key="entry.productId">
            <span>{{ entry.name }}</span>
            <span>{{ entry.stock }} ชิ้น</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  dashboard: {
    type: Object,
    required: true
  },
  days: {
    type: Number,
    default: 7
  }
})

const shortDate = (iso) => {
  const date = new Date(iso)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

const barHeight = (revenue) => {
  if (!Number.isFinite(revenue) || revenue <= 0) {
    return 10
  }

  return Math.min(100, Math.max(10, revenue / 500))
}
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.kpi-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  background: var(--bg-surface-soft);
}

.kpi-label {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.kpi-value {
  margin: 6px 0 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.analytics-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.analytics-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
}

.analytics-card h3 {
  margin: 0 0 10px;
  font-size: 1rem;
}

.spark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(38px, 1fr));
  align-items: end;
  gap: 8px;
  min-height: 120px;
}

.spark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.spark-item p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.spark-bar {
  width: 100%;
  min-height: 10px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f59e0b, #ea580c);
}

.mini-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.mini-list li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px;
}

@media (max-width: 880px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
