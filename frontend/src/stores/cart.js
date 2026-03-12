import { defineStore } from 'pinia'

import { api } from '../lib/api'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart')) || [],
    checkoutResult: null,
    errorMessage: ''
  }),

  getters: {
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },

  actions: {
    getGuestCartFromStorage() {
      try {
        const raw = JSON.parse(localStorage.getItem('cart') || '[]')
        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    },

    saveLocalCart() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },

    authHeaders() {
      const authStore = useAuthStore()
      return authStore.authHeaders()
    },

    shouldUseServerCart() {
      const authStore = useAuthStore()
      return Boolean(authStore.token)
    },

    mapServerItems(items) {
      return items.map((item) => ({
        cartItemId: item.cartItemId,
        cartKey: `server-${item.cartItemId}`,
        id: item.productId,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        qty: item.qty,
        stock: item.stock,
      }))
    },

    async loadCart() {
      if (!this.shouldUseServerCart()) {
        this.items = this.getGuestCartFromStorage()
        return
      }

      try {
        const response = await api.get('/cart', {
          headers: this.authHeaders()
        })

        this.items = this.mapServerItems(response.data.items || [])
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'โหลดตะกร้าไม่สำเร็จ'
      }
    },

    async mergeGuestCartIntoServerCart() {
      this.errorMessage = ''

      if (!this.shouldUseServerCart()) {
        return
      }

      const guestItems = this.getGuestCartFromStorage()
      if (guestItems.length === 0) {
        return
      }

      for (const item of guestItems) {
        if (!item?.id || !item?.qty) {
          continue
        }

        try {
          await api.post('/cart/items', {
            productId: item.id,
            quantity: item.qty
          }, {
            headers: this.authHeaders()
          })
        } catch (error) {
          this.errorMessage = error?.response?.data?.message || 'ย้ายตะกร้าชั่วคราวไม่สำเร็จ'
        }
      }

      localStorage.removeItem('cart')
    },

    addToCartGuest(product) {
      const cartKey = product.id + '-' + product.name

      const existing = this.items.find(i => i.cartKey === cartKey)

      if (existing) {
        existing.qty++
      } else {
        this.items.push({
          ...product,
          cartKey,
          qty: 1
        })
      }

      this.saveLocalCart()
    },

    async addToCart(product) {
      this.errorMessage = ''

      if (!this.shouldUseServerCart()) {
        this.addToCartGuest(product)
        return
      }

      try {
        const response = await api.post('/cart/items', {
          productId: product.id,
          quantity: 1
        }, {
          headers: this.authHeaders()
        })

        this.items = this.mapServerItems(response.data.items || [])
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ'
      }
    },

    async increase(cartKey) {
      if (!this.shouldUseServerCart()) {
        const item = this.items.find(i => i.cartKey === cartKey)
        if (item) {
          item.qty++
          this.saveLocalCart()
        }
        return
      }

      const item = this.items.find(i => i.cartKey === cartKey)
      if (!item?.cartItemId) {
        return
      }

      try {
        const response = await api.patch(`/cart/items/${item.cartItemId}`, {
          quantity: item.qty + 1
        }, {
          headers: this.authHeaders()
        })

        this.items = this.mapServerItems(response.data.items || [])
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'อัปเดตจำนวนสินค้าไม่สำเร็จ'
      }
    },

    async decrease(cartKey) {
      if (!this.shouldUseServerCart()) {
        const item = this.items.find(i => i.cartKey === cartKey)
        if (item && item.qty > 1) {
          item.qty--
          this.saveLocalCart()
        }
        return
      }

      const item = this.items.find(i => i.cartKey === cartKey)
      if (!item?.cartItemId || item.qty <= 1) {
        return
      }

      try {
        const response = await api.patch(`/cart/items/${item.cartItemId}`, {
          quantity: item.qty - 1
        }, {
          headers: this.authHeaders()
        })

        this.items = this.mapServerItems(response.data.items || [])
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'อัปเดตจำนวนสินค้าไม่สำเร็จ'
      }
    },

    async removeFromCart(cartKey) {
      if (!this.shouldUseServerCart()) {
        this.items = this.items.filter(i => i.cartKey !== cartKey)
        this.saveLocalCart()
        return
      }

      const item = this.items.find(i => i.cartKey === cartKey)
      if (!item?.cartItemId) {
        return
      }

      try {
        const response = await api.delete(`/cart/items/${item.cartItemId}`, {
          headers: this.authHeaders()
        })

        this.items = this.mapServerItems(response.data.items || [])
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'ลบสินค้าไม่สำเร็จ'
      }
    },

    async checkout() {
      this.errorMessage = ''
      this.checkoutResult = null

      if (!this.shouldUseServerCart()) {
        this.errorMessage = 'กรุณาเข้าสู่ระบบก่อนชำระเงิน'
        return null
      }

      try {
        const response = await api.post('/cart/checkout', null, {
          headers: this.authHeaders()
        })

        this.checkoutResult = response.data.order
        this.items = []

        return response.data.order
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'ชำระเงินไม่สำเร็จ'
        return null
      }
    }
  }
})
