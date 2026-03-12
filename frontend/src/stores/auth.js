import { defineStore } from 'pinia'
import { api } from '../lib/api'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const getInitialUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
        return null
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY) || '',
        user: getInitialUser()
    }),

    getters: {
        isAuthenticated: (state) => Boolean(state.token && state.user)
    },

    actions: {
        setSession(payload) {
            this.token = payload.token
            this.user = payload.user

            localStorage.setItem(TOKEN_KEY, this.token)
            localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        },

        clearSession() {
            this.token = ''
            this.user = null

            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
        },

        authHeaders() {
            if (!this.token) {
                return {}
            }

            return {
                Authorization: `Bearer ${this.token}`
            }
        },

        async initializeSession() {
            if (!this.token) {
                return
            }

            try {
                const response = await api.get('/auth/me', {
                    headers: this.authHeaders()
                })

                this.user = response.data.user
                localStorage.setItem(USER_KEY, JSON.stringify(this.user))
            } catch {
                this.clearSession()
            }
        },

        async register(payload) {
            const response = await api.post('/auth/register', payload)
            this.setSession(response.data)
            return response.data
        },

        async updateMe(payload) {
            const response = await api.patch('/auth/me', payload, {
                headers: this.authHeaders()
            })

            this.user = response.data.user
            localStorage.setItem(USER_KEY, JSON.stringify(this.user))

            return response.data
        },

        async login(payload) {
            const response = await api.post('/auth/login', payload)
            this.setSession(response.data)
            return response.data
        },

        async logout() {
            try {
                if (this.token) {
                    await api.post('/auth/logout', null, {
                        headers: this.authHeaders()
                    })
                }
            } finally {
                this.clearSession()
            }
        }
    }
})
