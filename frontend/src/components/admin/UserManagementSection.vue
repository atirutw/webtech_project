<template>
  <section class="section">
    <div class="section-head">
      <h2 class="h5 mb-0">จัดการผู้ใช้</h2>
    </div>

    <div class="toolbar">
      <input
        :value="userSearch"
        class="form-control"
        type="text"
        placeholder="ค้นหาผู้ใช้ด้วยชื่อหรืออีเมล"
        @input="$emit('updateUserSearch', $event.target.value)" />
    </div>

    <div v-if="userMessage" class="alert mb-3 py-2" :class="userMessage.includes('ไม่สำเร็จ') ? 'alert-danger' : 'alert-success'">
      {{ userMessage }}
    </div>
    <div class="table-wrap">
      <table class="table table-dark table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อ</th>
            <th>อีเมล</th>
            <th>Role</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <input v-model="userDrafts[user.id].name" class="form-control form-control-sm" type="text" />
            </td>
            <td>
              <input v-model="userDrafts[user.id].email" class="form-control form-control-sm" type="email" />
            </td>
            <td>
              <select v-model="userDrafts[user.id].role" class="form-select form-select-sm" :disabled="user.id === currentUserId">
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td class="actions">
              <button class="btn btn-outline-success btn-sm" @click="$emit('saveUser', user.id)">บันทึก</button>
              <router-link :to="`/admin/users/${user.id}/orders`" class="btn btn-outline-info btn-sm">
                ประวัติการซื้อ
              </router-link>
              <button
                class="btn btn-outline-danger btn-sm"
                :disabled="user.id === currentUserId"
                @click="$emit('requestDeleteUser', user)">
                ลบ
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="empty-row">ไม่พบผู้ใช้ที่ตรงเงื่อนไข</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  userSearch: {
    type: String,
    required: true
  },
  userMessage: {
    type: String,
    default: ''
  },
  filteredUsers: {
    type: Array,
    required: true
  },
  userDrafts: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: Number,
    default: null
  }
})

defineEmits(['updateUserSearch', 'saveUser', 'requestDeleteUser'])
</script>
