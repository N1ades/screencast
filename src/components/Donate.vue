<template>
  <div class="donate-container">
    <HeaderBar />
    <div class="donate-card">
      <div class="donate-header">
        <div class="donate-title">Support Nyades</div>
        <div class="donate-subtitle">Choose your preferred donation method</div>
      </div>
      <div class="donate-methods">
        <!-- Credit Card -->
        <div class="donate-method donate-credit" tabindex="0" @click="showKofi">
          <div class="donate-icon bg-purple">
            <img src="/src/assets/icons/credit-card.svg" alt="Credit Card" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title purple">Payment Card</div>
            <div class="donate-method-desc purple">Visa & Mastercard</div>
          </div>
        </div>
        <!-- MIR Card -->
        <a class="donate-method donate-mir" tabindex="0"
          href="https://www.tbank.ru/rm/r_qiDJRIDVKx.vnXggUVAoS/rikeI60663/" target="_blank" rel="noopener noreferrer">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/mir-card.svg" alt="MIR Card" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">MIR Card</div>
            <div class="donate-method-desc blue">Payment Card (MIR)</div>
          </div>
        </a>
        <!-- DonationAlerts (now SBP QR modal/link) -->
        <component :is="isMobile ? 'a' : 'div'" class="donate-method donate-alerts" tabindex="0"
          @click="isMobile ? null : showQr('sbp')"
          :href="isMobile ? 'https://qr.nspk.ru/BS2A006UJGIT109A9GQ9VI4PT1S5MKP4?type=04&bank=100000000004&crc=27A0' : undefined"
          :target="isMobile ? '_blank' : undefined" :rel="isMobile ? 'noopener noreferrer' : undefined">
          <div class="donate-icon bg-pink">
            <img src="/src/assets/icons/donation-alerts.svg" alt="DonationAlerts" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title pink">СБП (Система быстрых платежей)</div>
            <div class="donate-method-desc pink">SBP QR</div>
          </div>
        </component>
        <!-- Ko-fi -->
        <div class="donate-method donate-kofi" tabindex="0" @click="showKofi">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/kofi.svg" alt="Ko-fi" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">PayPal</div>
            <div class="donate-method-desc blue">Support via PayPal</div>
          </div>
        </div>
        <!-- WeChat Pay & Alipay in one row -->
        <div class="donate-method-row">
          <div class="donate-method donate-wechat" tabindex="0" @click="showQr('wechat')">
            <div class="donate-icon bg-green">
              <img src="/src/assets/icons/wechat-pay.svg" alt="WeChat Pay" />
            </div>
            <div class="donate-info">
              <div class="donate-method-title green">WeChat Pay</div>
              <div class="donate-method-desc green">微信支付</div>
            </div>
          </div>
          <div class="donate-method donate-alipay" tabindex="0" @click="showQr('alipay')">
            <div class="donate-icon bg-blue">
              <img src="/src/assets/icons/alipay.svg" alt="Alipay" />
            </div>
            <div class="donate-info">
              <div class="donate-method-title blue">Alipay</div>
              <div class="donate-method-desc blue">支付宝</div>
            </div>
          </div>
        </div>
      </div>
      <div class="donate-footer">
        Thank you for your support! <span class="heart">&lt;3</span>
      </div>
    </div>
    <!-- QR Modal -->
    <div v-if="qrModal" class="qr-modal" @click.self="closeQr">
      <div class="qr-modal-content">
        <img v-if="qrType === 'wechat'" src="/src/assets/wechatqr.png" alt="WeChat QR" />
        <img v-if="qrType === 'alipay'" src="/src/assets/alipayqr.jpg" alt="Alipay QR" />
        <img v-if="qrType === 'sbp'" src="/src/assets/sbpqr.svg" alt="SBP QR" />
        <button class="qr-modal-close" @click="closeQr">Close</button>
      </div>
    </div>
    <!-- Ko-fi Modal -->
    <div v-if="kofiModal" class="qr-modal" @click.self="closeKofi">
      <div class="qr-modal-content kofi-modal-content">
        <iframe id="kofiframe" src="https://ko-fi.com/nyades/?hidefeed=true&widget=true&embed=true&preview=true"
          style="border:none;width:100%;max-width:600px;padding:4px;background:#f9f9f9;" height="712"
          title="nyades"></iframe>
        <button class="qr-modal-close" @click="closeKofi">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mobileCheck } from '../lib/mobile-check';
import HeaderBar from './HeaderBar.vue';
export default {
  name: 'DonatePage',
  components: { HeaderBar },
  data() {
    return {
      qrModal: false,
      qrType: null,
      kofiModal: false,
      isMobile: false,
    };
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    showQr(type) {
      this.qrType = type;
      this.qrModal = true;
    },
    closeQr() {
      this.qrModal = false;
      this.qrType = null;
    },
    showKofi() {
      this.kofiModal = true;
    },
    closeKofi() {
      this.kofiModal = false;
    },
    checkMobile() {
      this.isMobile = mobileCheck();
    },
  },
}
</script>

<style scoped lang="scss">
$donate-pink-light: (
  #F9A8D4,
  18%
);
$donate-blue-light: (
  #93C5FD,
  18%
);
$donate-purple-light: (
  #C4B5FD,
  18%
);
$donate-green-light: (
  #6EE7B7,
  18%
);

.donate-container {
  min-height: 100vh;
  width: 100vw;
  /* VRCast background style */
  background: url('/src/assets/background.svg'), linear-gradient(90deg, #111827 0%, rgb(0, 0, 0) 50%, #111827 100%);
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-blend-mode: difference;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5rem 0;
  color: #fff;
  font-family: 'Orbitron', 'Quicksand', sans-serif;
}

.donate-card {
  max-width: 448px;
  width: 100%;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  /* Match VRCast glassmorphism styles, no shadow */
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: none;
  outline: 1px solid rgba(139, 92, 246, 0.2);
}

.donate-header {
  margin-bottom: 2rem;
  text-align: center;
}

.donate-title {
  color: #ffffff;
  font-size: 2rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 2.25rem;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
}

.donate-subtitle {
  color: #A78BFA;
  font-size: 1rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 1.2rem;
  letter-spacing: 0.5px;
}

.donate-methods {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.donate-method {
  display: flex;
  align-items: center;
  /* Glassmorphism styles, no shadow */
  border-radius: 12px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  outline: none;
  border: none;
  backdrop-filter: blur(8px) saturate(160%);
  -webkit-backdrop-filter: blur(8px) saturate(160%);

  &.donate-alerts {
    background: linear-gradient(90deg, rgba(#F9A8D4, 0.18) 0%, rgba(#F9A8D4, 0.07) 100%);
  }

  &.donate-mir {
    background: linear-gradient(90deg, rgba(#93C5FD, 0.18) 0%, rgba(#93C5FD, 0.07) 100%);
  }

  &.donate-credit {
    background: linear-gradient(90deg, rgba(#C4B5FD, 0.18) 0%, rgba(#C4B5FD, 0.07) 100%);
  }

  &.donate-kofi {
    background: linear-gradient(90deg, rgba(#93C5FD, 0.18) 0%, rgba(#93C5FD, 0.07) 100%);
  }

  &.donate-wechat {
    background: linear-gradient(90deg, rgba(#6EE7B7, 0.18) 0%, rgba(#6EE7B7, 0.07) 100%);
  }

  &.donate-alipay {
    background: linear-gradient(90deg, rgba(#93C5FD, 0.18) 0%, rgba(#93C5FD, 0.07) 100%);
  }

  &:hover,
  &:focus {
    transform: translateY(-2px) scale(1.025);

    &.donate-alerts {
      background: linear-gradient(90deg, rgba(#F9A8D4, 0.28) 0%, rgba(#F9A8D4, 0.12) 100%);
    }

    &.donate-mir {
      background: linear-gradient(90deg, rgba(#93C5FD, 0.28) 0%, rgba(#93C5FD, 0.12) 100%);
    }

    &.donate-credit {
      background: linear-gradient(90deg, rgba(#C4B5FD, 0.28) 0%, rgba(#C4B5FD, 0.12) 100%);
    }

    &.donate-kofi {
      background: linear-gradient(90deg, rgba(#93C5FD, 0.28) 0%, rgba(#93C5FD, 0.12) 100%);
    }

    &.donate-wechat {
      background: linear-gradient(90deg, rgba(#6EE7B7, 0.28) 0%, rgba(#6EE7B7, 0.12) 100%);
    }

    &.donate-alipay {
      background: linear-gradient(90deg, rgba(#93C5FD, 0.28) 0%, rgba(#93C5FD, 0.12) 100%);
    }
  }

  .donate-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .donate-method-title {
      font-size: 1rem;
      font-family: 'Quicksand', sans-serif;
      font-weight: 400;
      line-height: 1rem;
      letter-spacing: 0.5px;
    }

    .donate-method-desc {
      font-size: 0.875rem;
      font-family: 'Quicksand', sans-serif;
      font-weight: 400;
      line-height: 0.875rem;

      &.pink {
        color: $donate-pink-light;
      }

      &.blue {
        color: $donate-blue-light;
      }

      &.purple {
        color: $donate-purple-light;
      }

      &.green {
        color: $donate-green-light;
      }

      opacity: 0.7;
    }
  }
}

.donate-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  background: rgba(139, 92, 246, 0.07);
}

.bg-pink {
  background: rgba(236, 72, 153, 0.10);
}

.bg-blue {
  background: rgba(59, 130, 246, 0.10);
}

.bg-purple {
  background: rgba(139, 92, 246, 0.10);
}

.bg-green {
  background: rgba(16, 185, 129, 0.10);
}

.donate-icon img {
  max-width: 30px;
  max-height: 24px;
}

.donate-footer {
  margin-top: 2rem;
  text-align: center;
  color: #C4B5FD;
  font-size: 0.95rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 1.1rem;
  letter-spacing: 0.5px;
}

.heart {
  color: #F9A8D4;
}

.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-modal-content {
  background: #18181b;
  border-radius: 12px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
  min-width: 90vw;

  min-width: min(90vw, 450px);
  max-width: 90vw;
}

.qr-modal-content img {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.kofi-modal-content iframe {
  width: 100%;
  min-width: 320px;
  max-width: 600px;
  height: 712px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.qr-modal-close {
  background: #C4B5FD;
  color: #18181b;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.qr-modal-close:hover {
  background: #A78BFA;
}

.mobile-link {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.donate-method-row {
  display: flex;
  flex-direction: row;
  gap: 1.25rem;
  width: 100%;
  justify-content: space-between;
}
.donate-method-row .donate-method {
  flex: 1 1 0;
  min-width: 0;
}
@media (max-width: 600px) {
  .donate-card {
    max-width: 100vw;
    padding: 1rem 0.25rem 1rem 0.25rem;
  }

  .donate-title {
    font-size: 1.5rem;
    line-height: 1.5rem;
  }

  .donate-method {
    padding: 0.75rem 0.5rem;
  }

  .donate-icon {
    margin-right: 0.75rem;
  }

  .donate-method-row {
    flex-direction: column;
    gap: 1.25rem;
  }
}
</style>