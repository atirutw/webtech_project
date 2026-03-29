<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="h5 mb-3">แก้ไขสินค้า #{{ editForm.id }}</h3>

      <div class="form-grid modal-form-grid">
        <div class="field">
          <label>ชื่อสินค้า</label>
          <input v-model="editForm.name" class="form-control" type="text" />
        </div>

        <div class="field">
          <label>แบรนด์</label>
          <input v-model="editForm.brand" class="form-control" type="text" />
        </div>

        <div class="field">
          <label>หมวดหมู่</label>
          <select v-model="editForm.category" class="form-select">
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>ราคา</label>
          <input v-model.number="editForm.price" class="form-control" type="number" min="0" />
        </div>

        <div class="field">
          <label>สต็อก</label>
          <input v-model.number="editForm.stock" class="form-control" type="number" min="0" />
        </div>

        <div class="field wide">
          <label>รูปภาพสินค้า (อัปโหลดเข้าเซิร์ฟเวอร์)</label>
          <div class="d-flex gap-2 align-items-center">
            <input
              class="form-control"
              type="file"
              accept="image/*"
              :disabled="isUploadingImage || isSavingEdit"
              @change="$emit('uploadImage', $event.target.files?.[0] || null)" />
            <span v-if="isUploadingImage" class="small text-secondary">กำลังอัปโหลด...</span>
          </div>
          <small v-if="editForm.image" class="text-success mt-1">อัปโหลดแล้ว: {{ editForm.image }}</small>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-light" :disabled="isSavingEdit" @click="$emit('close')">ยกเลิก</button>
        <button class="btn btn-warning fw-semibold" :disabled="isSavingEdit" @click="$emit('save')">
          <span v-if="isSavingEdit" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSavingEdit ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
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
  editForm: {
    type: Object,
    required: true
  },
  categoryOptions: {
    type: Array,
    required: true
  },
  isSavingEdit: {
    type: Boolean,
    required: true
  },
  isUploadingImage: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close', 'save', 'uploadImage'])
</script>
