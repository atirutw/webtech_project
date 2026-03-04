<template>
  <section class="accessory">
    <h2>- ACCESSORIES -</h2>

    <div class="grid">
      <div class="card" v-for="item in accessories" :key="item.name">
        <img :src="item.image" />
        <p>{{ item.name }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const accessories = [
  {
    name: "TRS Cable",
    image: "/src/assets/accessory/TRS Cable.jpg"
  },
  {
    name: "Pick",
    image: "/src/assets/accessory/PICK.jpg"
  },
  {
    name: " Tuner",
    image: "/src/assets/accessory/Tuner.jpg"
  },
  {
    name: "Stand",
    image: "src/assets/accessory/stand.jpg"
  }
]
</script>

<style scoped>
.accessory {
 background: transparent;
  padding: 60px 40px;
  text-align: center;
  color: white;
}

.accessory h2 {
  margin-bottom: 40px;
  letter-spacing: 3px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.card {
  border: 1px solid rgba(255,255,255,0.2);
  padding: 20px;
  transition: 0.3s;
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card:hover {
  transform: scale(1.05);
  border-color: #ffcc00;
}
</style>