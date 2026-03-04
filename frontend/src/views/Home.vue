<template>
  <div class="home">

    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <h1>🎵 Welcome to MusicStore</h1>
        <p>เครื่องดนตรีคุณภาพ สำหรับมืออาชีพและผู้เริ่มต้น</p>
        <div class="hero-buttons">
          <router-link to="/products" class="btn-primary">
            เลือกซื้อสินค้า
          </router-link>
          <router-link to="/category/guitar" class="btn-outline">
            ดูกีตาร์ทั้งหมด
          </router-link>
        </div>
      </div>
    </section>

    <!-- CATEGORY SECTION -->
    <section class="category-section">
      <h2>หมวดหมู่ยอดนิยม</h2>

      <div class="category-grid">
        <div class="category-card" @click="$router.push('/category/guitar')">
          <img src="/src/assets/guitar/Fender.jpg" />
          <div class="overlay">Guitar</div>
        </div>

        <div class="category-card" @click="$router.push('/category/violin')">
          <img src="/src/assets/violin/violin2.jpg" />
          <div class="overlay">Violin</div>
        </div>

        <div class="category-card" @click="$router.push('/category/saxophone')">
          <img src="/src/assets/sax/Saxophone Coleman CL-334S.jpg" />
          <div class="overlay">Saxophone</div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="featured">
      <h2>🔥 สินค้าแนะนำ</h2>

      <div class="featured-grid">
        <div class="featured-card">
          <img src="/src/assets/guitar/Gibson.jpg" />
          <h3>Gibson Les Paul</h3>
          <p>45,000 บาท</p>
        </div>

        <div class="featured-card">
          <img src="/src/assets/violin/violin3.jpg" />
          <h3>Hofner Violin</h3>
          <p>23,000 บาท</p>
        </div>

        <div class="featured-card">
          <img src="/src/assets/sax/Saxophone Coleman CL-334S.jpg" />
          <h3>Coleman Saxophone</h3>
          <p>18,000 บาท</p>
        </div>
      </div>

      <router-link to="/products" class="btn-viewall">
        ดูสินค้าทั้งหมด →
      </router-link>
    </section>

  </div>
</template>

<style scoped>
.home {
  color: white;
  background-image: url('@/assets/music.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
}

/* HERO */
.hero {
  position: relative;
  height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

/* overlay ทำให้ตัวหนังสืออ่านชัด */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.85;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn-primary {
  background: #ffc107;
  padding: 12px 25px;
  border-radius: 8px;
  color: black;
  font-weight: bold;
  text-decoration: none;
  transition: 0.3s;
}

.btn-primary:hover {
  transform: translateY(-3px);
  background: #ffca2c;
}

.btn-outline {
  border: 2px solid #ffc107;
  padding: 12px 25px;
  border-radius: 8px;
  color: #ffc107;
  text-decoration: none;
  transition: 0.3s;
}

.btn-outline:hover {
  background: #ffc107;
  color: black;
  transform: translateY(-3px);
}

/* CATEGORY */
.category-section {
  padding: 80px 60px;
  text-align: center;
  background: rgba(0,0,0,0.6);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px,1fr));
  gap: 30px;
  margin-top: 40px;
}

.category-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
}

.category-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: 0.5s;
}

.category-card:hover img {
  transform: scale(1.1);
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0,0,0,0.7);
  padding: 15px;
  font-size: 20px;
}

/* FEATURED */
.featured {
  padding: 80px 60px;
  text-align: center;
  background: rgba(0,0,0,0.6);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
  gap: 30px;
  margin-top: 40px;
}

.featured-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
}

.featured-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.btn-viewall {
  display: inline-block;
  margin-top: 40px;
  background: #ffc107;
  padding: 12px 25px;
  border-radius: 8px;
  color: black;
  font-weight: bold;
  text-decoration: none;
}
</style>