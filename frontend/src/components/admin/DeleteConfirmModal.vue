<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal-card confirm-card">
      <h3 class="h5 mb-2">ยืนยันการลบ</h3>
      <p class="confirm-text mb-3">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn btn-light" :disabled="isDeleting" @click="$emit('close')">ยกเลิก</button>
        <button class="btn btn-danger" :disabled="isDeleting" @click="$emit('confirm')">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  isDeleting: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close', 'confirm'])
</script>
