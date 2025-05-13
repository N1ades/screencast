<template>
  <div class="header">
    <div class="header-content">
      <router-link to="/" class="logo" style="text-decoration: none;">
        <img class="logo-icon" src="@/assets/icons/logo-icon.svg" alt="Logo Icon" />
        <div class="logo-text">VrBroadcast</div> <span class="logo-subtext">Pre-alpha</span>
      </router-link>
      <div class="header-actions">
        <template v-if="externalLinks">
          <a class="nav-link" href="/contact" target="_blank" rel="noopener">Contact Me</a>
          <a href="/donate" class="donate-btn" target="_blank" rel="noopener">Donate</a>
        </template>
        <template v-else>
          <router-link class="nav-link" to="/contact">Contact Me</router-link>
          <router-link class="donate-btn" to="/donate">Donate</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'HeaderBar',
  props: {
    externalLinks: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.header {
  width: 100%;
  height: 57px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}
.header-content {
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
}
.donate-btn {
  background: linear-gradient(90deg, #7C3AED 0%, #DB2777 100%);
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 15px;
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
  border: none;
  margin-left: 16px;
  cursor: pointer;
}
.donate-btn:hover {
  background: linear-gradient(90deg, #DB2777 0%, #7C3AED 100%);
}
.logo {
  display: flex;
  align-items: center;
}
.logo-icon {
  width: 30px;
  height: 24px;
  position: relative;
}
.logo-text {
  margin-left: 8px;
  font-size: 16px;
  letter-spacing: 0.8px;
  line-height: 16px;
}
.logo-subtext {
  font-family: 'Quicksand', sans-serif;
  margin-left: 4px;
  font-size: 12px;
  color: rgba(196, 181, 253, 0.8);
}
.nav-link {
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 15px;
  text-decoration: none;
  font-weight: 600;
  margin-right: 16px;
  cursor: pointer;
}
.nav-link:hover {
  text-decoration: underline;
}
</style>
