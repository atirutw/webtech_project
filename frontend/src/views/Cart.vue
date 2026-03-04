<template>
  <div class="cart-page">
    <div class="cart-container">

      <!-- LEFT -->
      <div class="cart-card">
        <h2>🛒 ตะกร้าสินค้า</h2>

        <div v-if="items.length === 0" class="empty">
          <p>ตะกร้ายังว่างอยู่</p>
          <router-link to="/products" class="shop-btn">
            ไปเลือกสินค้า
          </router-link>
        </div>

        <div v-else>
          <div
            v-for="item in items"
            :key="item.cartKey"
            class="item"
          >
            <img :src="item.image" class="item-img" />

            <div class="info">
              <h4>{{ item.name }}</h4>
              <p>{{ item.price }} บาท</p>
            </div>

            <div class="qty">
              <button @click="decrease(item.cartKey)">-</button>
              <span>{{ item.qty }}</span>
              <button @click="increase(item.cartKey)">+</button>
            </div>

            <div class="total">
              {{ item.price * item.qty }} ฿
            </div>

            <button
              class="remove"
              @click="removeFromCart(item.cartKey)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="summary-card">
        <h3>สรุปคำสั่งซื้อ</h3>

        <div class="row">
          <span>รวมสินค้า</span>
          <span>{{ totalPrice }} ฿</span>
        </div>

        <div class="row">
          <span>ค่าจัดส่ง</span>
          <span style="color:#00ff99;">ฟรี</span>
        </div>

        <hr />

        <div class="row total-row">
          <span>รวมทั้งหมด</span>
          <span>{{ totalPrice }} ฿</span>
        </div>

        <button
          class="checkout"
          :disabled="items.length === 0"
        >
          ชำระเงิน
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useCartStore } from "../stores/cart"
import { storeToRefs } from "pinia"

const cartStore = useCartStore()

// ✅ ทำให้ reactive จริง
const { items, totalPrice } = storeToRefs(cartStore)

// เรียก action ตรง ๆ
const { increase, decrease, removeFromCart } = cartStore
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  padding: 120px 5% 50px;
}

.cart-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.cart-card,
.summary-card {
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px;
  color: white;
}

.item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.item-img {
  width: 70px;
  border-radius: 10px;
}

.qty {
  display: flex;
  gap: 10px;
  align-items: center;
}

.qty button {
  background: orange;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.remove {
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
}

.summary-card .row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.total-row {
  font-weight: bold;
  font-size: 18px;
}

.checkout {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(45deg, #ffb300, #ff8800);
  font-weight: bold;
  cursor: pointer;
}

.checkout:disabled {
  background: gray;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .cart-container {
    grid-template-columns: 1fr;
  }
}
</style>