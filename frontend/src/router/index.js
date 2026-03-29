import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Cart from '../views/Cart.vue'
import Profile from '../views/Profile.vue'
import AdminPanel from '../views/AdminPanel.vue'
import Orders from '../views/Orders.vue'
import OrderDetail from '../views/OrderDetail.vue'
import AdminUserOrders from '../views/AdminUserOrders.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/orders/:orderId',
    name: 'OrderDetail',
    component: OrderDetail
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel
  },
  {
    path: '/admin/users/:userId/orders',
    name: 'AdminUserOrders',
    component: AdminUserOrders
  },
  {
    path: '/admin/orders/:orderId',
    name: 'AdminOrderDetail',
    component: OrderDetail
  },
  {
    path: '/accessory',
    redirect: '/products'
  },
  {
    path: '/category/:categoryName',
    component: Products
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
