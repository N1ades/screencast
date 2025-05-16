import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n';
import { getPreferredLocale } from './utils/locale';

const i18n = createI18n({
    locale: getPreferredLocale('en'),
    fallbackLocale: 'en',
});

const app = createApp(App);
app.use(router);
app.use(i18n);

app.mount('#app')
