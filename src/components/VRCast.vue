<!-- VRCast.vue -->
<template>
  <div class="vrcast-container">
    <HeaderBar :externalLinks="isStreaming" />
    <!-- Main Content -->
    <div class="main-content">
      <!-- Cast Card -->
      <div class="cast-card">
        <div class="card-content">
          <div class="title-section">
            <h1 class="card-title">Stream to VRChat</h1>
            <p class="card-subtitle">Share your {{ streamMode }} in virtual reality</p>
          </div>
          <div class="action-section">
            <button class="start-button" :class="{ streaming: isStreaming }" @click="toggleStream">
              <img v-if="isStreaming" class="button-icon" src="/src/assets/icons/stop-icon.svg" alt="Stop Icon" />
              <img v-else class="button-icon" src="/src/assets/icons/button-icon.svg" alt="Button Icon" />
              <span>
                {{ isStreaming
                  ? (streamMode === 'camera' ? 'Stop Broadcast' : 'Stop Screencast')
                  : (streamMode === 'camera' ? 'Start Broadcast' : 'Start Screencast')
                }}
              </span>
            </button>

            <!-- SwitchToggle component for Stream Mode -->
            <SwitchToggle v-if="!isStreaming" v-model="streamMode" :modes="['camera', 'screen']"
              @change="setStreamMode" />
          </div>
          <div class="status-indicator">
            <div class="status-dot" :style="{ background: isStreaming ? '#10B981' : '#F59E42' }"></div>
            <div class="status-text" :style="{ color: isStreaming ? '#34D399' : '#FBBF24' }">
              {{ isStreaming ? (streamError ? 'Error' : 'Streaming') : 'Ready' }}
            </div>
          </div>
          <div v-if="streamError" class="error-message">{{ streamError }}</div>
          <!-- RTMP Link Copy Section -->
          <div v-if="isStreaming && !streamError" class="rtmp-link-section">
            <div class="rtmp-link-label">RTMP Stream Link</div>
            <div class="rtmp-link-row">
              <input class="rtmp-link-input" :value="rtmpLink || 'Loading...'" :readonly="true" :disabled="!rtmpLink" />
              <button class="copy-btn" @click="copyRtmpLink">
                <span v-if="!copied">Copy</span>
                <span v-else class="copied-feedback">Copied!</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stats-card">
          <div class="stats-content">
            <span class="stats-label">Viewers</span>
            <span class="stats-value">{{ viewers }}</span>
          </div>
        </div>
        <div v-if="isStreaming" class="stats-card">
          <div class="stats-content">
            <span class="stats-label">Quality</span>
            <span class="stats-value">{{ quality }} <span class="stats-value-factor">{{ factor }}</span></span>
          </div>
        </div>
        <QualitySelector v-else class="stats-card" v-model="qualityPreset" />

        <div class="stats-card">
          <div class="stats-content">
            <span class="stats-label">Latency</span>
            <span class="stats-value">{{ latency }}</span>
          </div>
        </div>
      </div>
      <!-- Screencast Preview -->
      <div v-if="isStreaming" class="preview-section">
        <!-- <video ref="previewVideo" autoplay muted playsinline class="preview-video"></video> -->
        <canvas ref=canvas class="preview-canvas"></canvas>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeaderBar from './HeaderBar.vue';
import { BroadcastManager } from '../lib/broadcast-manager.ts';
import SwitchToggle from './SwitchToggle.vue';
import QualitySelector from './QualitySelector.vue';

export default defineComponent({
  name: 'VRCast',
  components: { HeaderBar, SwitchToggle, QualitySelector },
  data() {
    return {
      viewers: '?',
      quality: '720p',
      qualityPreset: '720p',
      latency: '5-10s',
      factor: '',
      isStreaming: false,
      broadcastManager: null as BroadcastManager | null,
      streamError: '',
      rtmpLink: '',
      copied: false,
      streamMode: 'screen', // Default mode
    }
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.preventClose);
    this.broadcastManager?.destroy();
  },
  methods: {
    async toggleStream() {
      this.streamError = '';
      if (this.isStreaming) {
        window.removeEventListener('beforeunload', this.preventClose);
        this.broadcastManager?.destroy()
        return
      }
      this.isStreaming = true;
      window.addEventListener('beforeunload', this.preventClose);

      this.$nextTick(async () => {
        try {
          this.broadcastManager = new BroadcastManager(this.$refs.canvas, this.streamMode);
          this.broadcastManager.addEventListener('link', (rtmpLink) => {
            this.rtmpLink = rtmpLink;
          })
          this.broadcastManager.addEventListener('resize', ({ originalWidth, originalHeight, width, height }) => {

            const factor = (width * height) / (originalWidth * originalHeight);

            this.quality = `${width}x${height}`

            this.factor = factor != 1 ? `${Math.round(factor * 100)}%` : ''
          })
          this.broadcastManager.addEventListener('error', (error) => {
            this.streamError = error.message;
          })

          await this.broadcastManager.start();
        } catch (error) {
          this.streamError = 'Failed to start screencast: ' + (error && error.message ? error.message : error);
        } finally {
          this.isStreaming = false;
          this.factor = '';
          this.quality = '720p';
        }
      });
    },
    async copyRtmpLink() {
      try {
        await navigator.clipboard.writeText(this.rtmpLink);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 1200);
      } catch (e) {
        // fallback or error handling
      }
    },
    setStreamMode(mode: string) {
      this.streamMode = mode;
    },
    preventClose(event) {
      event.preventDefault();
      event.returnValue = '';
    },
  }
})
</script>

<style>
/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.vrcast-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: white;
  font-family: 'Orbitron', sans-serif;
  background: url('/src/assets/background.svg'), linear-gradient(90deg, #111827 0%, rgb(0, 0, 0) 50%, #111827 100%);
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-blend-mode: difference;

}

/* Header styles */
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

.logo-icon-inner {
  width: 30px;
  height: 18px;
  background: #A78BFA;
  position: absolute;
  top: 3px;
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

.header-icons {
  display: flex;
  gap: 24px;
}

.header-icon {
  width: 16px;
  height: 16px;
}

.icon-wrapper {
  width: 100%;
  height: 100%;
}

.icon-inner {
  width: 100%;
  height: 100%;
  background: #C4B5FD;
}

/* Main content styles */
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* Cast card styles */
.cast-card {
  width: 100%;
  max-width: 768px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  position: relative;
  padding: 33px;
  margin-bottom: 32px;
  outline: 1px solid rgba(139, 92, 246, 0.2);
}

.card-content {
  position: relative;
}

.title-section {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-size: 30px;
  line-height: 30px;
  letter-spacing: 1.5px;
  font-weight: 400;
  margin-bottom: 18px;
}

.card-subtitle {
  font-size: 16px;
  line-height: 16px;
  color: rgba(196, 181, 253, 0.8);
}

.action-section {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.start-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240px;
  height: 56px;
  background: linear-gradient(90deg, #7C3AED 0%, #DB2777 100%);
  border-radius: 12px;
  border: none;
  color: white;
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  cursor: pointer;
  position: relative;
}

.start-button.streaming {
  background: linear-gradient(90deg, #DB2777 0%, #7C3AED 100%);
}

.start-button:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.18);
}

.button-icon {
  width: 12px;
  height: 16px;
  margin-right: 8px;
}

.status-indicator {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  margin-right: 8px;
  opacity: 0.76;
}

.status-text {
  color: #34D399;
  font-size: 14px;
  line-height: 14px;
}

.error-message {
  color: #F87171;
  margin-top: 12px;
  text-align: center;
  font-size: 15px;
}

/* RTMP Link Copy Section styles */
.rtmp-link-section {
  margin-top: 28px;
  text-align: center;
}

.rtmp-link-label {
  color: #C4B5FD;
  font-size: 15px;
  margin-bottom: 7px;
  letter-spacing: 0.5px;
}

.rtmp-link-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.rtmp-link-input {
  width: 320px;
  max-width: 70vw;
  background: rgba(39, 39, 42, 0.7);
  border: 1px solid #A78BFA;
  border-radius: 7px;
  color: #fff;
  font-size: 15px;
  padding: 7px 12px;
  font-family: 'Orbitron', sans-serif;
  outline: none;
}

.copy-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #7C3AED 0%, #DB2777 100%);
  border: none;
  border-radius: 7px;
  color: #fff;
  font-size: 15px;
  padding: 7px 16px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  transition: background 0.2s;
  position: relative;
}

.copy-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.12);
}

.copy-btn:active {
  background: linear-gradient(90deg, #DB2777 0%, #7C3AED 100%);
}

.copy-icon {
  width: 16px;
  height: 16px;
  margin-right: 7px;
}

.copied-feedback {
  color: #34D399;
  margin-left: 2px;
  font-weight: 600;
  font-size: 15px;
}

/* Screencast preview styles */
.preview-section {
  width: 100%;
  max-width: 768px;
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.preview-video {
  width: 100%;
  max-width: 720px;
  border-radius: 12px;
  outline: 2px solid #A78BFA;
  background: #18181b;

  z-index: 0;
  position: absolute;
  visibility: hidden;
}

.preview-canvas {
  width: 100%;
  max-width: 720px;
  border-radius: 12px;
  outline: 2px solid #A78BFA;
  background: #18181b;
}

/* Stats section styles */
.stats-section {
  width: 100%;
  max-width: 768px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.stats-card {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 17px;
  outline: 1px solid rgba(139, 92, 246, 0.2);
}

.stats-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  color: #C4B5FD;
  font-size: 16px;
  line-height: 16px;
}

.stats-value {
  color: white;
  font-size: 16px;
  line-height: 16px;
}

.stats-value-factor {
  color: rgb(251, 191, 36);
  font-size: 16px;
  line-height: 16px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .cast-card {
    padding: 24px;
  }

  .card-title {
    font-size: 24px;
  }

  .stats-section {
    flex-direction: column;
  }

  .stats-card {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding-top: 70px;
  }

  .cast-card {
    padding: 16px;
  }

  .card-title {
    font-size: 20px;
  }

  .card-subtitle {
    font-size: 14px;
  }

  .start-button {
    width: 100%;
    height: 48px;
    font-size: 14px;
  }

  .switch-btn {
    width: 100px;
    height: 36px;
    font-size: 12px;
  }

  .status-indicator {
    position: relative;
    justify-content: center;
    margin-top: 16px;
  }

  .rtmp-link-input {
    width: 160px;
    font-size: 13px;
    padding: 6px 7px;
  }

  .copy-btn {
    font-size: 13px;
    padding: 6px 10px;
  }
}
</style>