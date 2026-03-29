<template>
  <div class="cart-page">
    <div class="container-fluid px-0">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="cart-card card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h4 mb-4 cart-title">
                <i class="bi bi-cart3" aria-hidden="true"></i>
                ตะกร้าสินค้า
              </h2>

              <div v-if="items.length === 0" class="text-center py-4">
                <p class="mb-3">ตะกร้ายังว่างอยู่</p>
                <router-link to="/products" class="btn btn-warning fw-semibold">
                  ไปเลือกสินค้า
                </router-link>
              </div>

              <ul v-else class="list-group list-group-flush">
                <li
                  v-for="item in items"
                  :key="item.cartKey"
                  class="list-group-item bg-transparent border-secondary-subtle px-0 cart-line"
                >
                  <div class="row g-3 align-items-center">
                    <div class="col-3 col-md-2">
                      <img :src="item.image" class="item-img" />
                    </div>

                    <div class="col-9 col-md-4">
                      <h4 class="h6 mb-1">{{ item.name }}</h4>
                      <p class="mb-0 item-unit-price">{{ item.price }} บาท</p>
                    </div>

                    <div class="col-7 col-md-3">
                      <div class="btn-group" role="group" aria-label="Quantity controls">
                        <button class="btn btn-outline-warning btn-sm" @click="decrease(item.cartKey)">-</button>
                        <button class="btn btn-outline-secondary btn-sm" disabled>{{ item.qty }}</button>
                        <button class="btn btn-outline-warning btn-sm" @click="increase(item.cartKey)">+</button>
                      </div>
                    </div>

                    <div class="col-3 col-md-2 fw-semibold">
                      {{ item.price * item.qty }} ฿
                    </div>

                    <div class="col-2 col-md-1 text-end">
                      <button class="btn btn-outline-danger btn-sm" @click="removeFromCart(item.cartKey)">
                        <i class="bi bi-x-lg" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="summary-card card border-0 shadow-sm position-sticky" style="top: 100px;">
            <div class="card-body p-4">
              <h3 class="h5 mb-3">สรุปคำสั่งซื้อ</h3>

              <button
                v-if="items.length > 0"
                class="btn btn-outline-danger w-100 fw-semibold mb-3"
                :disabled="isClearingCart || isCheckingOut"
                @click="handleClearCart"
              >
                <span v-if="isClearingCart" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isClearingCart ? 'กำลังล้างตะกร้า...' : 'ล้างตะกร้าทั้งหมด' }}
              </button>

              <div class="d-flex justify-content-between mb-2">
                <span>รวมสินค้า</span>
                <span>{{ totalPrice }} ฿</span>
              </div>

              <div class="d-flex justify-content-between mb-2">
                <span>ค่าจัดส่ง</span>
                <span class="text-success">ฟรี</span>
              </div>

              <hr class="border-secondary" />

              <div class="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>รวมทั้งหมด</span>
                <span>{{ totalPrice }} ฿</span>
              </div>

              <button
                class="btn btn-warning w-100 fw-semibold"
                :disabled="isCheckoutDisabled"
                @click="handleCheckout"
              >
                <span v-if="isCheckingOut" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isCheckingOut ? 'กำลังชำระเงิน...' : 'ชำระเงิน' }}
              </button>

              <div v-if="cartStore.errorMessage" class="alert alert-danger py-2 mt-3 mb-0">
                {{ cartStore.errorMessage }}
              </div>
              <div v-if="checkoutSuccessMessage" class="alert alert-success py-2 mt-3 mb-0">
                {{ checkoutSuccessMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useCartStore } from "../stores/cart"
import { storeToRefs } from "pinia"
import { useAuthStore } from "../stores/auth"

const cartStore = useCartStore()
const authStore = useAuthStore()
const isCheckingOut = ref(false)
const isClearingCart = ref(false)
const checkoutSuccessMessage = ref("")

const { items, totalPrice } = storeToRefs(cartStore)

const { increase, decrease, removeFromCart } = cartStore

const isCheckoutDisabled = computed(() =>
  items.value.length === 0 ||
  !authStore.isAuthenticated ||
  isCheckingOut.value ||
  isClearingCart.value,
)

const handleClearCart = async () => {
  checkoutSuccessMessage.value = ""
  isClearingCart.value = true
  await cartStore.clearCart()
  isClearingCart.value = false
}

const handleCheckout = async () => {
  checkoutSuccessMessage.value = ""
  isCheckingOut.value = true

  const order = await cartStore.checkout()

  if (order) {
    checkoutSuccessMessage.value = `ชำระเงินสำเร็จ คำสั่งซื้อ #${order.id}`
  }

  isCheckingOut.value = false
}

onMounted(async () => {
  await cartStore.loadCart()
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  padding: 120px 5% 50px;
}

.cart-card,
.summary-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.cart-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cart-line {
  color: var(--text-primary);
}

.item-unit-price {
  color: var(--text-secondary);
}

.item-img {
  width: 100%;
  max-width: 72px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
}
@media (max-width: 768px) {
  .cart-page {
    padding-inline: 16px;
  }
}
</style>
