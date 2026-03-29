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
          <input v-model="editForm.category" class="form-control" type="text" />
        </div>

        <div class="field">
          <label>ประเภทสินค้า</label>
          <select v-model="editForm.type" class="form-select">
            <option value="instrument">instrument</option>
            <option value="accessory">accessory</option>
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
          <label>URL รูปภาพ</label>
          <input v-model="editForm.image" class="form-control" type="text" />
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
  isSavingEdit: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close', 'save'])
</script>
