<template>
  <div class="contact-container">
    <HeaderBar />
    <div class="contact-card">
      <div class="contact-header">
        <div class="contact-title">{{ t('contactMe') }}</div>
        <div class="contact-subtitle">{{ t('getInTouch') }}</div>
      </div>
      <form class="contact-form" action="https://formsubmit.co/contactme@nyades.dev" method="POST">
        <input type="hidden" name="_captcha" value="false" />
        <div class="form-group">
          <label for="name">{{ t('name') }}</label>
          <input id="name" name="name" v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label for="email">{{ t('email') }}</label>
          <input id="email" name="email" v-model="form.email" type="email" required />
        </div>
        <div class="form-group">
          <label for="message">{{ t('message') }}</label>
          <textarea id="message" name="message" v-model="form.message" rows="5" required></textarea>
        </div>
        <button class="send-btn" type="submit">{{ t('send') }}</button>
        <div class="discord-link">
          <a href="https://discord.gg/rWJXGzSj" target="_blank" rel="noopener" >{{ t('joinDiscord') }}</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import HeaderBar from './HeaderBar.vue';
import { t } from '../i18n';
export default {
  name: 'ContactMe',
  components: { HeaderBar },
  data() {
    return {
      form: { name: '', email: '', message: '' },
      t, // expose t for template
    };
  },
};
</script>

<style scoped lang="scss">
.contact-container {
  min-height: 100vh;
  width: 100vw;
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
.contact-card {
  max-width: 448px;
  width: 100%;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: none;
  outline: 1px solid rgba(139, 92, 246, 0.2);
}
.contact-header {
  margin-bottom: 2rem;
  text-align: center;
}
.contact-title {
  color: #ffffff;
  font-size: 2rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 2.25rem;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
}
.contact-subtitle {
  color: #A78BFA;
  font-size: 1rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  line-height: 1.2rem;
  letter-spacing: 0.5px;
}
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label {
  color: #C4B5FD;
  font-size: 1rem;
  font-family: 'Quicksand', sans-serif;
}
input, textarea {
  background: rgba(39, 39, 42, 0.7);
  border: 1px solid #A78BFA;
  border-radius: 7px;
  color: #fff;
  font-size: 1rem;
  padding: 0.75rem 1rem;
  font-family: 'Quicksand', sans-serif;
  outline: none;
}
input:focus, textarea:focus {
  border-color: #8b5cf6;
}
.send-btn {
  background: linear-gradient(90deg, #7C3AED 0%, #DB2777 100%);
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.send-btn:hover {
  background: linear-gradient(90deg, #DB2777 0%, #7C3AED 100%);
}
.discord-link {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 1rem;
}
.discord-link a {
  color: #A78BFA;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
}
.discord-link a:hover {
  text-decoration: underline;
}
@media (max-width: 600px) {
  .contact-card {
    max-width: 100vw;
    padding: 1rem 0.25rem 1rem 0.25rem;
  }
  .contact-title {
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
}
</style>
