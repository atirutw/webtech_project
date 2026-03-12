<template>
  <div class="profile-page">
    <div class="profile-card">
      <h1>แก้ไขข้อมูลผู้ใช้</h1>

      <form @submit.prevent="handleProfileUpdate">
        <div class="input-group">
          <label>ชื่อ</label>
          <input v-model="name" type="text" required />
        </div>

        <div class="input-group">
          <label>อีเมล</label>
          <input v-model="email" type="email" required />
        </div>

        <div class="input-group">
          <label>รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)</label>
          <input v-model="newPassword" type="password" />
        </div>

        <div class="input-group" v-if="newPassword">
          <label>รหัสผ่านปัจจุบัน</label>
          <input v-model="currentPassword" type="password" />
        </div>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  name.value = authStore.user?.name || ''
  email.value = authStore.user?.email || ''
})

const handleProfileUpdate = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const payload = {
      name: name.value,
      email: email.value,
      currentPassword: currentPassword.value || undefined,
      newPassword: newPassword.value || undefined,
    }

    await authStore.updateMe(payload)

    currentPassword.value = ''
    newPassword.value = ''
    successMessage.value = 'อัปเดตข้อมูลเรียบร้อยแล้ว'
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'อัปเดตข้อมูลไม่สำเร็จ'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 20px 40px;
}

.profile-card {
  width: 460px;
  max-width: 100%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 16px;
  padding: 28px;
  color: white;
}

.profile-card h1 {
  margin-top: 0;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.input-group input {
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  background: linear-gradient(45deg, #ffc107, #ff9800);
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #ff6b6b;
}

.success {
  color: #7dff9f;
}
</style>
