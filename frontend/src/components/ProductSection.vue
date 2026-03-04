<template>
  <section class="product">
    <h2>- PRODUCT -</h2>

    <div class="grid">
      <div class="card" v-for="item in products" :key="item.name">
        <img :src="item.image" />
        <p>{{ item.name }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const products = [
  {
    name: "ELECTRIC",
    image: "/src/assets/guitar/ELECTRIC.jpg"
  },
  {
    name: "ACOUSTIC",
    image: "/src/assets/guitar/ACOUSTIC.jpg"
  },
  {
    name: "violin",
    image: "/src/assets/violin/violin.jpg"
  },
  {
    name: "Saxophone",
    image: "/src/assets/sax/Saxophone.jpg"
  }
]
</script>

<style scoped>
.product {
  padding: 100px 40px; /* เพิ่ม spacing ให้ดูโปร */
  text-align: center;
  color: white;

  /* ทำให้ section โปร่ง */
  background: transparent;
}

.product h2 {
  margin-bottom: 50px;
  letter-spacing: 4px;
  font-weight: 600;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

/* Card */
.card {
  background: transparent;
  backdrop-filter: blur(8px);
  border-radius: 12px;

  padding: 20px;
  transition: 0.3s;
  border: 1px solid rgba(255,255,255,0.2);
}

.card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
}

.card p {
  margin-top: 15px;
  font-weight: 500;
}

.card:hover {
  transform: translateY(-8px);
  border-color: #ffcc00;
}
</style>