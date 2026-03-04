import { defineStore } from "pinia"

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("cart")) || []
  }),

  getters: {
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },

  actions: {
    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.items))
    },

    addToCart(product) {
      const cartKey = product.id + "-" + product.name

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

      this.saveCart()
    },

    increase(cartKey) {
      const item = this.items.find(i => i.cartKey === cartKey)
      if (item) {
        item.qty++
        this.saveCart()
      }
    },

    decrease(cartKey) {
      const item = this.items.find(i => i.cartKey === cartKey)
      if (item && item.qty > 1) {
        item.qty--
        this.saveCart()
      }
    },

    removeFromCart(cartKey) {
      this.items = this.items.filter(i => i.cartKey !== cartKey)
      this.saveCart()
    }
  }
})