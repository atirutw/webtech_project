import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Cart from '../views/Cart.vue'
import Accessory from '../views/Accessory.vue'

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
  path: '/accessory',
  name: 'Accessory',
  component: Accessory
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