<template>
  <div class="donate-container">
    <div class="donate-card">
      <div class="donate-header">
        <div class="donate-title">Support Me</div>
        <div class="donate-subtitle">Choose your preferred donation method</div>
      </div>
      <div class="donate-methods">
        <!-- DonationAlerts -->
        <div class="donate-method donate-alerts" tabindex="0">
          <div class="donate-icon bg-pink">
            <img src="/src/assets/icons/donation-alerts.svg" alt="DonationAlerts" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title pink">DonationAlerts</div>
            <div class="donate-method-desc">СБП Payment System</div>
          </div>
        </div>
        <!-- MIR Card -->
        <div class="donate-method donate-mir" tabindex="0">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/mir-card.svg" alt="MIR Card" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">MIR Card</div>
            <div class="donate-method-desc">Payment Card (MIR)</div>
          </div>
        </div>
        <!-- Credit Card -->
        <div class="donate-method donate-credit" tabindex="0">
          <div class="donate-icon bg-purple">
            <img src="/src/assets/icons/credit-card.svg" alt="Credit Card" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title purple">Credit Card</div>
            <div class="donate-method-desc">Visa & Mastercard</div>
          </div>
        </div>
        <!-- Ko-fi -->
        <div class="donate-method donate-kofi" tabindex="0">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/kofi.svg" alt="Ko-fi" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">Ko-fi</div>
            <div class="donate-method-desc">Support via PayPal</div>
          </div>
        </div>
        <!-- WeChat Pay -->
        <div class="donate-method donate-wechat" tabindex="0">
          <div class="donate-icon bg-green">
            <img src="/src/assets/icons/wechat-pay.svg" alt="WeChat Pay" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title green">WeChat Pay</div>
            <div class="donate-method-desc">微信支付</div>
          </div>
        </div>
        <!-- Alipay -->
        <div class="donate-method donate-alipay" tabindex="0">
          <div class="donate-icon bg-blue">
            <img src="/src/assets/icons/alipay.svg" alt="Alipay" />
          </div>
          <div class="donate-info">
            <div class="donate-method-title blue">Alipay</div>
            <div class="donate-method-desc">支付宝</div>
          </div>
        </div>
      </div>
      <div class="donate-footer">
        Thank you for your support! <span class="heart">&lt;3</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DonatePage',
}
</script>

<style scoped>
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
  padding: 2rem 0;
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
  /* Glassmorphism styles */
  background: rgba(30, 27, 75, 0.35);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: none;
}
.donate-header {
  margin-bottom: 2rem;
  text-align: center;
}
.donate-title {
  color: #C4B5FD;
  font-size: 2rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 2.25rem;
  margin-bottom: 0.5rem;
  letter-spacing: 1.2px;
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
  /* Glassmorphism styles */
  background: rgba(31, 41, 55, 0.35);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  outline: none;
  box-shadow: 0 2px 12px 0 rgba(139, 92, 246, 0.08);
  border: none;
  backdrop-filter: blur(8px) saturate(160%);
  -webkit-backdrop-filter: blur(8px) saturate(160%);
}
.donate-method:hover, .donate-method:focus {
  box-shadow: 0 4px 24px 0 rgba(196,181,253,0.15);
  transform: translateY(-2px) scale(1.025);
  background: rgba(59, 130, 246, 0.18);
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
.bg-pink { background: rgba(236, 72, 153, 0.10); }
.bg-blue { background: rgba(59, 130, 246, 0.10); }
.bg-purple { background: rgba(139, 92, 246, 0.10); }
.bg-green { background: rgba(16, 185, 129, 0.10); }
.donate-icon img {
  max-width: 30px;
  max-height: 24px;
}
.donate-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.donate-method-title {
  font-size: 1rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 1rem;
  letter-spacing: 0.5px;
}
.pink { color: #F9A8D4; }
.blue { color: #93C5FD; }
.purple { color: #C4B5FD; }
.green { color: #6EE7B7; }
.donate-method-desc {
  color: #A78BFA;
  font-size: 0.875rem;
  font-family: 'Quicksand', sans-serif;
  font-weight: 400;
  line-height: 0.875rem;
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
}
</style>