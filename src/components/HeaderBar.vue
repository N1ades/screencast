<template>
  <div class="header">
    <div class="header-content">
      <router-link to="/" class="logo" style="text-decoration: none;">
        <img class="logo-icon" src="@/assets/icons/logo-icon.svg" :alt="t('logoAlt')" />
        <div class="logo-text">{{ t('appName') }}</div> <span class="logo-subtext">{{ t('preAlpha') }}</span>
      </router-link>
      <div class="header-actions">
        <template v-if="externalLinks">
          <a class="nav-link" href="https://disk.nyades.dev" target="_blank" rel="noopener">{{ t('realtimeFileSharing') }}</a>
          <a class="nav-link" href="/contact" target="_blank" rel="noopener">{{ t('contactMe') }}</a>
          <a href="/donate" class="donate-btn" target="_blank" rel="noopener">{{ t('donateBtn') }}</a>
        </template>
        <template v-else>
          <a class="nav-link" href="https://disk.nyades.dev" rel="noopener">{{ t('realtimeFileSharing') }}</a>
          <router-link class="nav-link" to="/contact">{{ t('contactMe') }}</router-link>
          <router-link class="donate-btn" to="/donate">{{ t('donateBtn') }}</router-link>
        </template>
        <div class="lang-switcher" tabindex="0" @blur="showDropdown = false" @keydown.esc="showDropdown = false">
          <button class="lang-btn" @click="showDropdown = !showDropdown" :aria-expanded="showDropdown" aria-haspopup="listbox">
            <svg class="lang-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#a78bfa" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 6h-3.17c-.19-1.19-.54-2.27-1.01-3.11A8.025 8.025 0 0 1 18.93 8zM12 4c.88 0 2.71 2.34 3.16 6h-6.32C9.29 6.34 11.12 4 12 4zM4.26 16A7.963 7.963 0 0 1 4 12c0-.69.07-1.36.18-2h3.64c-.05.66-.08 1.32-.08 2s.03 1.34.08 2H4.26zm.81 2h3.17c.19 1.19.54 2.27 1.01 3.11A8.025 8.025 0 0 1 5.07 18zm3.98-10.11C8.58 6.27 8.23 5.19 8.04 4H5.07a8.025 8.025 0 0 1 3.98 3.89zM12 20c-.88 0-2.71-2.34-3.16-6h6.32C14.71 17.66 12.88 20 12 20zm2.96-2.11c.47-.84.82-1.92 1.01-3.11h3.17a8.025 8.025 0 0 1-4.18 3.11zm1.19-5.89c.05-.66.08-1.32.08-2s-.03-1.34-.08-2h3.64c.11.64.18 1.31.18 2 0 .69-.07 1.36-.18 2h-3.64zM12 6c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2zm-2 6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm2 6c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/></svg>
            <span class="lang-label">{{ languageNames[locale] }}</span>
            <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#a78bfa" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
          </button>
          <ul v-show="showDropdown" class="lang-dropdown" role="listbox">
            <li v-for="(name, code) in languageNames" :key="code" :class="{ active: locale === code }" role="option" :aria-selected="locale === code" @click="selectLocale(code)">{{ name }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import i18n, { t, setLocale } from '../i18n';
export default defineComponent({
  name: 'HeaderBar',
  props: {
    externalLinks: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const locale = computed({
      get: () => i18n.state.locale,
      set: (val: string) => setLocale(val),
    });
    const showDropdown = ref(false);
    const languageNames = {
      en: 'English',
      ru: 'Русский',
      zh: '中文',
      ja: '日本語',
    };
    const selectLocale = (code: string) => {
      locale.value = code;
      showDropdown.value = false;
    };
    return {
      t,
      locale,
      showDropdown,
      languageNames,
      selectLocale,
    };
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

.lang-switcher {
  display: flex;
  align-items: center;
  margin-left: 18px;
  position: relative;
}

.lang-btn {
  background: none;
  border: none;
  color: #a78bfa;
  border-radius: 5px;
  padding: 8px 12px;
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s, color 0.2s;
}

.lang-btn:hover {
  background: rgba(139, 92, 246, 0.1);
}

.lang-icon {
  width: 18px;
  height: 18px;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.dropdown-arrow[aria-expanded="true"] {
  transform: rotate(180deg);
}

.lang-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #18181b;
  border: 1px solid #a78bfa;
  border-radius: 8px;
  margin-top: 8px;
  padding: 8px 0;
  width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 20;
  list-style: none;
}

.lang-dropdown li {
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  list-style: none;
}

.lang-dropdown li:hover,
.lang-dropdown li.active {
  background: rgba(139, 92, 246, 0.2);
}
</style>
