<template>
  <div class="stats-card quality-selector" @click="openSelector">
    <div class="stats-content">
      <span class="stats-label">{{ t('quality') }}</span>
      <span class="stats-value">
        {{ displayQuality }}
        <span class="stats-value-factor">{{ factor }}</span>
        <span class="arrow" :class="{ open: showMenu }">▼</span>
      </span>
    </div>
    <div v-if="showMenu" class="quality-menu" @click.stop>
      <div v-for="option in options" :key="option.value" class="quality-option" @click="select(option)">
        <span>{{ option.label }}</span>
        <!-- <span v-if="option.value === '1080p'" class="pro-badge">{{ t('pro') }}</span> -->
      </div>
    </div>
    <div v-if="showPro" class="pro-popup">
      {{ t('proPopupText') }}
      <button class="close-pro" @click.stop="showPro = false">OK</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { t } from '../i18n';
export default defineComponent({
  name: 'QualitySelector',
  props: {
    modelValue: { type: String, required: true },
    factor: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const showMenu = ref(false);
    const showPro = ref(false);
    const options = [
      { value: '1440p', label: '1440p' },
      { value: '1080p', label: '1080p' },
      { value: '720p', label: '720p' },
      { value: '480p', label: '480p' },
    ];
    const displayQuality = computed(() => props.modelValue);

    function openSelector() {
      showMenu.value = !showMenu.value;
    }
    function select(option) {
      showMenu.value = false;
      if (option.value === '1080p') {
        showPro.value = true;
        return;
      }
      emit('update:modelValue', option.value);
    }
    return { showMenu, showPro, options, openSelector, select, displayQuality, t };
  },
});
</script>

<style scoped>
.quality-selector {
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
}

.quality-selector:hover {
  background: rgba(139, 92, 246, 0.08);
}

.stats-value {
  display: flex;
  align-items: center;
  /* gap: 7px; */
}

.arrow {
  margin-left: 8px;
  font-size: 13px;
  color: #fff;
  transition: transform 0.2s;
  user-select: none;
}

.arrow.open {
  transform: rotate(180deg);
}

.quality-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #18181b;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.15);
  z-index: 20;
  min-width: 120px;
  margin-top: 7px;
  outline: 1px solid rgba(139, 92, 246, 0.2);
  width: 100%;
  overflow: hidden;
}

.quality-option {
  padding: 10px 18px;
  color: #fff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.15s;
  cursor: pointer;
}

.quality-option:hover {
  background: #312e81;
}

.pro-badge {
  background: #fbbf24;
  color: #18181b;
  font-size: 12px;
  border-radius: 6px;
  padding: 2px 7px;
  margin-left: 8px;
  font-weight: 600;
}

.pro-popup {
  margin-top: 7px;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  top: 110%;
  left: 0;
  background: #18181b;
  color: #fbbf24;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 15px;
  z-index: 30;
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.15);
  outline: 1px solid #fbbf24;
  display: flex;
  align-items: center;
  gap: 16px;
}

.close-pro {
  background: #fbbf24;
  color: #18181b;
  border: none;
  border-radius: 6px;
  padding: 4px 14px;
  font-size: 14px;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  margin-left: 12px;
}
</style>
