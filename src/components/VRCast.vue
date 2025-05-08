<!-- VRCast.vue -->
<template>
  <div class="vrcast-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <img class="logo-icon" src="/src/assets/icons/logo-icon.svg" alt="Logo Icon" />
          <div class="logo-text">VRCast</div>
        </div>
        <div class="header-actions">
          <a href="/donate" target="_blank" rel="noopener" class="donate-btn">Donate</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Cast Card -->
      <div class="cast-card">
        <div class="card-content">
          <div class="title-section">
            <h1 class="card-title">Stream to VRChat</h1>
            <p class="card-subtitle">Share your screen in virtual reality</p>
          </div>
          <div class="action-section">
            <button class="start-button" :class="{ streaming: isStreaming }" @click="toggleStream">
              <img class="button-icon" :src="isStreaming ? '/src/assets/icons/stop-icon.svg' : '/src/assets/icons/button-icon.svg'" :alt="isStreaming ? 'Stop Icon' : 'Button Icon'" />
              <span>{{ isStreaming ? 'Stop Screencast' : 'Start Screencast' }}</span>
            </button>
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
              <input class="rtmp-link-input" :value="rtmpLink" readonly />
              <button class="copy-btn" @click="copyRtmpLink">
                <!-- <img src="/src/assets/icons/copy-icon.svg" alt="Copy" class="copy-icon" /> -->
                <span v-if="!copied">Copy</span>
                <span v-else class="copied-feedback">Copied!</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Screencast Preview -->
      <div v-if="isStreaming && stream" class="preview-section">
        <video ref="previewVideo" autoplay muted playsinline class="preview-video"></video>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stats-card">
          <div class="stats-content">
            <span class="stats-label">Viewers</span>
            <span class="stats-value">{{ viewers }}</span>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-content">
            <span class="stats-label">Quality</span>
            <span class="stats-value">{{ quality }}</span>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-content">
            <span class="stats-label">Latency</span>
            <span class="stats-value">{{ latency }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WebRTCStreamer } from '../webrtc';

export default {
  name: 'VRCast',
  data() {
    return {
      viewers: 0,
      quality: '1080p',
      latency: '45ms',
      isStreaming: false,
      stream: null,
      streamError: '',
      rtmpLink: 'rtmp://live.vrchat.com/app/your-stream-key', // Example RTMP link
      copied: false,
      webrtcStreamer: null
    }
  },
  methods: {
    async toggleStream() {
      if (!this.isStreaming) {
        this.streamError = '';
        try {
          const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          this.stream = mediaStream;
          this.isStreaming = true;
          // Send stream to server via WebRTC
          this.webrtcStreamer = new WebRTCStreamer('wss://your-signaling-server'); // Replace with your signaling server URL
          await this.webrtcStreamer.start(mediaStream);
          this.$nextTick(() => {
            if (this.$refs.previewVideo) {
              this.$refs.previewVideo.srcObject = this.stream;
            }
          });
        } catch (err) {
          this.streamError = 'Failed to start screencast: ' + (err && err.message ? err.message : err);
          this.isStreaming = false;
          this.stream = null;
        }
      } else {
        // Stop streaming
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.webrtcStreamer) {
          this.webrtcStreamer.stop();
          this.webrtcStreamer = null;
        }
        this.isStreaming = false;
        this.stream = null;
        this.streamError = '';
      }
    },
    async copyRtmpLink() {
      try {
        await navigator.clipboard.writeText(this.rtmpLink);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 1200);
      } catch (e) {
        // fallback or error handling
      }
    }
  }
}
</script>

<style scoped>
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
  margin-bottom: 32px;
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
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.preview-video {
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