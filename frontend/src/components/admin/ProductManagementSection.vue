<template>
  <section class="section">
    <div class="section-head">
      <h2 class="h5 mb-0">จัดการสินค้า</h2>
    </div>

    <div class="toolbar">
      <input
        :value="productSearch"
        class="form-control"
        type="text"
        placeholder="ค้นหาสินค้า/แบรนด์/หมวดหมู่"
        @input="$emit('updateProductSearch', $event.target.value)" />
    </div>

    <div class="form-grid">
      <div class="field">
        <label>ชื่อสินค้า</label>
        <input v-model="productForm.name" class="form-control" type="text" placeholder="เช่น Fender Stratocaster" />
      </div>

      <div class="field">
        <label>แบรนด์</label>
        <input v-model="productForm.brand" class="form-control" type="text" placeholder="เช่น Fender" />
      </div>

      <div class="field">
        <label>หมวดหมู่</label>
        <select v-model="productForm.category" class="form-select">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>ราคา</label>
        <input v-model.number="productForm.price" class="form-control" type="number" min="0" placeholder="เช่น 12900" />
      </div>

      <div class="field">
        <label>สต็อก</label>
        <input v-model.number="productForm.stock" class="form-control" type="number" min="0" placeholder="เช่น 20" />
      </div>

      <div class="field wide">
        <label>รูปภาพสินค้า (อัปโหลดเข้าเซิร์ฟเวอร์)</label>
        <div class="d-flex gap-2 align-items-center">
          <input
            class="form-control"
            type="file"
            accept="image/*"
            :disabled="isUploadingImage || isSubmittingProduct"
            @change="$emit('uploadProductImage', $event.target.files?.[0] || null)" />
          <span v-if="isUploadingImage" class="small text-secondary">กำลังอัปโหลด...</span>
        </div>
        <small v-if="productForm.image" class="text-success mt-1">อัปโหลดแล้ว: {{ productForm.image }}</small>
      </div>
    </div>

    <button class="btn btn-warning fw-semibold" :disabled="isSubmittingProduct" @click="$emit('createProduct')">
      <span v-if="isSubmittingProduct" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ isSubmittingProduct ? 'กำลังบันทึก...' : 'เพิ่มสินค้า' }}
    </button>
    <div v-if="productMessage" class="alert mt-3 mb-0 py-2" :class="productMessage.includes('ไม่สำเร็จ') ? 'alert-danger' : 'alert-success'">
      {{ productMessage }}
    </div>

    <div class="table-wrap">
      <table class="table table-dark table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>สินค้า</th>
            <th>หมวดหมู่</th>
            <th>ราคา</th>
            <th>สต็อก</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredProducts" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.price }}</td>
            <td>{{ item.stock }}</td>
            <td class="actions">
              <button class="btn btn-outline-warning btn-sm" @click="$emit('openEditProduct', item)">แก้ไข</button>
              <button class="btn btn-outline-danger btn-sm" @click="$emit('requestDeleteProduct', item)">ลบ</button>
            </td>
          </tr>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="6" class="empty-row">ไม่พบสินค้าที่ตรงเงื่อนไข</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  productSearch: {
    type: String,
    required: true
  },
  productForm: {
    type: Object,
    required: true
  },
  categoryOptions: {
    type: Array,
    required: true
  },
  isSubmittingProduct: {
    type: Boolean,
    required: true
  },
  isUploadingImage: {
    type: Boolean,
    required: true
  },
  productMessage: {
    type: String,
    default: ''
  },
  filteredProducts: {
    type: Array,
    required: true
  }
})

defineEmits([
  'updateProductSearch',
  'uploadProductImage',
  'createProduct',
  'openEditProduct',
  'requestDeleteProduct'
])
</script>
