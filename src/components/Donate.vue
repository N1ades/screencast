<template>
  <div class="donate-container">
    <HeaderBar />
    <div class="donate-card">
      <div class="donate-header">
        <div class="donate-title">{{ t('donate.supportNyades') }}</div>
        <div class="donate-subtitle">{{ t('donate.chooseMethod') }}</div>
      </div>
      <div class="donate-methods">
        <!-- Credit Card -->
        <div class="donate-method donate-credit" tabindex="0" @click="showKofi">
          <div class="donate-icon bg-purple">
            <img src="/src/assets/icons/credit-card.svg" :alt="t('donate.creditCardAlt')" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title purple">{{ t('donate.paymentCard') }}</div>
            <div class="donate-method-desc purple">{{ t('donate.visaMastercard') }}</div>
          </div>
        </div>
        <!-- MIR Card -->
        <a class="donate-method donate-mir" tabindex="0"
          href="https://www.tbank.ru/rm/r_qiDJRIDVKx.vnXggUVAoS/rikeI60663/" target="_blank" rel="noopener noreferrer">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/mir-card.svg" :alt="t('donate.mirCardAlt')" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">{{ t('donate.mirCard') }}</div>
            <div class="donate-method-desc blue">{{ t('donate.paymentCardMir') }}</div>
          </div>
        </a>
        <!-- SBP method temporarily disabled -->
        <div class="donate-method donate-alerts disabled" tabindex="-1">
          <div class="donate-icon bg-gray">
            <img src="/src/assets/icons/donation-alerts.svg" :alt="t('donate.sbpAlt')" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title gray">{{ t('donate.sbpTitle') }} ({{ t('donate.temporarilyDisabled') }})</div>
            <div class="donate-method-desc gray">{{ t('donate.sbpDesc') }}</div>
          </div>
        </div>
        <!-- DonationAlerts -->
        <a class="donate-method donate-donationalerts" tabindex="0"
          href="https://www.donationalerts.com/c/nyades" target="_blank" rel="noopener noreferrer">
          <div class="donate-icon bg-orange">
            <img src="/src/assets/icons/donationalerts-official.svg" :alt="t('donate.donationAlertsAlt')" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title orange">{{ t('donate.donationAlerts') }}</div>
            <div class="donate-method-desc orange">{{ t('donate.donationAlertsDesc') }}</div>
          </div>
        </a>
        <!-- Ko-fi -->
        <div class="donate-method donate-kofi" tabindex="0" @click="showKofi">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/kofi.svg" :alt="t('donate.kofiAlt')" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">{{ t('donate.paypal') }}</div>
            <div class="donate-method-desc blue">{{ t('donate.supportViaPaypal') }}</div>
          </div>
        </div>
        <!-- WeChat Pay & Alipay in one row -->
        <div class="donate-method-row">
          <div class="donate-method donate-wechat" tabindex="0" @click="showQr('wechat')">
            <div class="donate-icon bg-green">
              <img src="/src/assets/icons/wechat-pay.svg" :alt="t('donate.wechatAlt')" />
            </div>
            <div class="donate-info">
              <div class="donate-method-title green">{{ t('donate.wechatPay') }}</div>
              <div class="donate-method-desc green">{{ t('donate.wechatPayZh') }}</div>
            </div>
          </div>
          <div class="donate-method donate-alipay" tabindex="0" @click="showQr('alipay')">
            <div class="donate-icon bg-blue">
              <img src="/src/assets/icons/alipay.svg" :alt="t('donate.alipayAlt')" />
            </div>
            <div class="donate-info">
              <div class="donate-method-title blue">{{ t('donate.alipay') }}</div>
              <div class="donate-method-desc blue">{{ t('donate.alipayZh') }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="donate-footer">
        {{ t('donate.thankYou') }} <span class="heart">&lt;3</span>
      </div>
    </div>
    <!-- QR Modal -->
    <div v-if="qrModal" class="qr-modal" @click.self="closeQr">
      <div class="qr-modal-content">
        <img v-if="qrType === 'wechat'" src="/src/assets/wechatqr.png" :alt="t('donate.wechatQrAlt')" />
        <img v-if="qrType === 'alipay'" src="/src/assets/alipayqr.jpg" :alt="t('donate.alipayQrAlt')" />
        <img v-if="qrType === 'sbp'" src="/src/assets/sbpqr.svg" :alt="t('donate.sbpQrAlt')" />
        <button class="qr-modal-close" @click="closeQr">{{ t('close') }}</button>
      </div>
    </div>
    <!-- Ko-fi Modal -->
    <div v-if="kofiModal" class="qr-modal" @click.self="closeKofi">
      <div class="qr-modal-content kofi-modal-content">
        <iframe id="kofiframe" src="https://ko-fi.com/nyades/?hidefeed=true&widget=true&embed=true&preview=true"
          style="border:none;width:100%;max-width:600px;padding:4px;background:#f9f9f9;" height="712"
          title="nyades"></iframe>
        <button class="qr-modal-close" @click="closeKofi">{{ t('close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mobileCheck } from '../lib/mobile-check';
import HeaderBar from './HeaderBar.vue';
import { t } from '../i18n';
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
    t, // expose t for template
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
$donate-orange-light: (
  #FBBF24,
  18%
);
$donate-gray-light: (
  #9CA3AF,
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

  &.donate-donationalerts {
    background: linear-gradient(90deg, rgba(#FBBF24, 0.18) 0%, rgba(#FBBF24, 0.07) 100%);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background: linear-gradient(90deg, rgba(#6B7280, 0.18) 0%, rgba(#6B7280, 0.07) 100%);
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

    &.donate-donationalerts {
      background: linear-gradient(90deg, rgba(#FBBF24, 0.28) 0%, rgba(#FBBF24, 0.12) 100%);
    }
  }

  &.disabled:hover,
  &.disabled:focus {
    transform: none;
    background: linear-gradient(90deg, rgba(#6B7280, 0.18) 0%, rgba(#6B7280, 0.07) 100%);
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

      &.orange {
        color: $donate-orange-light;
      }

      &.gray {
        color: $donate-gray-light;
      }
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

      &.orange {
        color: $donate-orange-light;
      }

      &.gray {
        color: $donate-gray-light;
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

.bg-orange {
  background: rgba(251, 191, 36, 0.10);
}

.bg-gray {
  background: rgba(107, 114, 128, 0.10);
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