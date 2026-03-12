<template>
  <div class="profile-page">
    <div class="profile-card card border-0 shadow-lg p-4">
      <h1 class="h3 mb-4">แก้ไขข้อมูลผู้ใช้</h1>

      <form @submit.prevent="handleProfileUpdate" class="d-grid gap-3">
        <div>
          <label class="form-label">ชื่อ</label>
          <input v-model="name" type="text" required class="form-control" />
        </div>

        <div>
          <label class="form-label">อีเมล</label>
          <input v-model="email" type="email" required class="form-control" />
        </div>

        <div>
          <label class="form-label">รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)</label>
          <input v-model="newPassword" type="password" class="form-control" />
        </div>

        <div v-if="newPassword">
          <label class="form-label">รหัสผ่านปัจจุบัน</label>
          <input
            v-model="currentPassword"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': requiresCurrentPassword }"
          />
          <div class="invalid-feedback" v-if="requiresCurrentPassword">
            กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนรหัสผ่านใหม่
          </div>
        </div>

        <button type="submit" class="btn btn-warning fw-semibold" :disabled="isSubmitting || requiresCurrentPassword">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
        </button>
      </form>

      <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0 py-2">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success mt-3 mb-0 py-2">{{ successMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
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
const requiresCurrentPassword = computed(() => Boolean(newPassword.value) && !currentPassword.value)

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
  color: white;
}
</style>
