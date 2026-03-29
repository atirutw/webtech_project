<template>
  <div class="profile-page">
    <div class="profile-card card border-0 shadow-lg p-4">
      <h1 class="h3 mb-4">แก้ไขข้อมูลผู้ใช้</h1>

      <div class="avatar-section mb-4">
        <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="Profile avatar" class="avatar-preview" />
        <div v-else class="avatar-fallback">{{ userInitials }}</div>

        <div class="avatar-controls">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            :disabled="isUploadingAvatar || isSubmitting"
            @click="openAvatarPicker"
          >
            {{ isUploadingAvatar ? 'กำลังอัปโหลด...' : 'เลือกรูปโปรไฟล์' }}
          </button>
          <input
            id="avatar-upload"
            ref="avatarInput"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/*"
            class="d-none"
            @change="handleAvatarSelected"
          />
          <p class="avatar-hint mb-0">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 2MB</p>
        </div>
      </div>

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
const isUploadingAvatar = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const avatarInput = ref(null)
const avatarPreviewUrl = ref('')
const requiresCurrentPassword = computed(() => Boolean(newPassword.value) && !currentPassword.value)
const userInitials = computed(() => {
  const rawName = name.value?.trim() || authStore.user?.name?.trim() || ''

  if (!rawName) {
    return 'U'
  }

  return rawName
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('')
})

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  name.value = authStore.user?.name || ''
  email.value = authStore.user?.email || ''
  avatarPreviewUrl.value = authStore.user?.avatar || ''
})

const openAvatarPicker = () => {
  avatarInput.value?.click()
}

const handleAvatarSelected = async (event) => {
  const target = event.target
  const file = target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
    target.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'รูปภาพต้องมีขนาดไม่เกิน 2MB'
    target.value = ''
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isUploadingAvatar.value = true

  try {
    const response = await authStore.uploadAvatar(file)
    avatarPreviewUrl.value = response.user?.avatar || ''
    successMessage.value = 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว'
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'อัปเดตรูปโปรไฟล์ไม่สำเร็จ'
  } finally {
    isUploadingAvatar.value = false
    target.value = ''
  }
}

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
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 16px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-preview,
.avatar-fallback {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid var(--border);
  flex-shrink: 0;
}

.avatar-preview {
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--accent), transparent 74%);
  color: #9a3412;
}

.avatar-controls {
  min-width: 0;
}

.avatar-hint {
  margin-top: 4px;
  font-size: 0.82rem;
  color: var(--text-secondary);
}
</style>
