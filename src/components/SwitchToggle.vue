<template>
  <div class="plnt-switch">
    <div class="toggle plnt-toggle-switch">
      <div class="indicator" :style="indicatorStyle"></div>
      <button
        v-for="(mode, idx) in modes"
        :key="mode"
        :class="{ active: modelValue === mode }"
        @click="$emit('update:modelValue', mode); $emit('change', mode, idx)"
        ref="toggleBtns"
        :aria-label="mode.charAt(0).toUpperCase() + mode.slice(1)"
      >
        <img
          v-if="mode === 'camera'"
          src="/src/assets/icons/camera-icon.svg"
          alt="Camera Mode"
          class="toggle-icon"
        />
        <img
          v-else
          src="/src/assets/icons/screen-icon.svg"
          alt="Screen Mode"
          class="toggle-icon"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SwitchToggle',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    modes: {
      type: Array,
      default: () => ['camera', 'screen']
    }
  },
  data() {
    return {
      indicatorLeft: 0,
      indicatorWidth: 0,
    }
  },
  computed: {
    indicatorStyle() {
      return {
        width: this.indicatorWidth + 'px',
        left: this.indicatorLeft + 'px',
      };
    }
  },
  mounted() {
    this.$nextTick(this.updateIndicator);
    window.addEventListener('resize', this.updateIndicator);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateIndicator);
  },
  watch: {
    modelValue() {
      this.$nextTick(this.updateIndicator);
    }
  },
  methods: {
    updateIndicator() {
      const btns = this.$refs.toggleBtns;
      let btnArr = btns instanceof Array ? btns : [btns];
      let idx = this.modes.indexOf(this.modelValue);
      const btn = btnArr[idx];
      if (btn) {
        this.indicatorWidth = btn.offsetWidth + 2;
        this.indicatorLeft = btn.offsetLeft && btn.offsetLeft + 1;
      }
    }
  }
})
</script>

<style scoped>
.plnt-switch {
  width: auto;
  max-width: 400px;
  margin: 1em auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plnt-switch .toggle {
  display: inline-block;
  width: auto;
  margin: 0 auto;
  height: 3em;
  border-radius: 5rem;
  background: linear-gradient(90deg, #18181b 0%, #2d2d34 100%);
  position: relative;
  border: 1px solid #a98cff4d;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
}

.plnt-switch .toggle button {
  float: left;
  text-align: center;
  height: 100%;
  color: #a78bfa;
  position: relative;
  cursor: pointer;
  transition: color 0.2s, font-weight 0.2s, background 0.2s;
  z-index: 3;
  font-weight: 600;
  line-height: 2.7rem;
  padding: 0 1.5rem;
  background: none;
  border: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plnt-switch .toggle button.active {
  color: #fff;
  font-weight: 700;
  background: rgba(139, 92, 246, 0.08);
  border-radius: 2rem;
}

.toggle-icon {
  width: 24px;
  height: 24px;
  display: block;
  filter: drop-shadow(0 1px 2px rgba(139,92,246,0.10));
  opacity: 0.8;
  transition: opacity 0.2s, filter 0.2s;
}

.plnt-switch .toggle button.active .toggle-icon {
  opacity: 1;
  filter: drop-shadow(0 2px 8px #a78bfa);
}
.plnt-switch .toggle .indicator {
  display: block;
  height: calc(100% + 2px);
  background: linear-gradient(90deg, #7C3AED 0%, #DB2777 100%);
      background: linear-gradient(90deg, #bb27db 0%, #3c46d8 100%);
  background-clip: padding-box;
  border-radius: 3rem;
  position: absolute;
  top: -1px;
  transition: left 0.2s, width 0.2s;
  z-index: 2;
  margin-left: -1px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.12);

  
  border: 1px solid #ffffff75;
  opacity: 0.8;
}
</style>
