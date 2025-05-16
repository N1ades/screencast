// src/i18n.ts
import { reactive } from 'vue';

const messages: Record<string, Record<string, string>> = {
  en: {
    appName: 'VrBroadcast',
    preAlpha: 'Pre-alpha',
    streamToVRChat: 'Stream to VRChat',
    shareYour: 'Share your {mode} in virtual reality',
    startBroadcast: 'Start Broadcast',
    stopBroadcast: 'Stop Broadcast',
    startScreencast: 'Start Screencast',
    stopScreencast: 'Stop Screencast',
    ready: 'Ready',
    streaming: 'Streaming',
    error: 'Error',
    viewers: 'Viewers',
    quality: 'Quality',
    latency: 'Latency',
    rtmpStreamLink: 'RTMP Stream Link',
    copy: 'Copy',
    copied: 'Copied!',
    supportNyades: 'Support Nyades',
    chooseDonation: 'Choose your preferred donation method',
    paymentCard: 'Payment Card',
    visaMaster: 'Visa & Mastercard',
    mirCard: 'MIR Card',
    paymentCardMir: 'Payment Card (MIR)',
    sbp: 'СБП (Система быстрых платежей)',
    sbpQR: 'SBP QR',
    paypal: 'PayPal',
    supportViaPaypal: 'Support via PayPal',
    wechatPay: 'WeChat Pay',
    wechatPayZh: '微信支付',
    alipay: 'Alipay',
    alipayZh: '支付宝',
    thankYou: 'Thank you for your support!',
    contactMe: 'Contact Me',
    getInTouch: 'Get in touch with Nyades',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    joinDiscord: 'Join our Discord',
    close: 'Close',
    ok: 'OK',
  },
  ru: {
    appName: 'VrBroadcast',
    preAlpha: 'Пре-альфа',
    streamToVRChat: 'Трансляция в VRChat',
    shareYour: 'Делитесь своим {mode} в виртуальной реальности',
    startBroadcast: 'Начать трансляцию',
    stopBroadcast: 'Остановить трансляцию',
    startScreencast: 'Начать скринкаст',
    stopScreencast: 'Остановить скринкаст',
    ready: 'Готово',
    streaming: 'В эфире',
    error: 'Ошибка',
    viewers: 'Зрители',
    quality: 'Качество',
    latency: 'Задержка',
    rtmpStreamLink: 'Ссылка на RTMP поток',
    copy: 'Копировать',
    copied: 'Скопировано!',
    supportNyades: 'Поддержать Nyades',
    chooseDonation: 'Выберите способ поддержки',
    paymentCard: 'Банковская карта',
    visaMaster: 'Visa и Mastercard',
    mirCard: 'Карта МИР',
    paymentCardMir: 'Карта МИР',
    sbp: 'СБП (Система быстрых платежей)',
    sbpQR: 'СБП QR',
    paypal: 'PayPal',
    supportViaPaypal: 'Поддержать через PayPal',
    wechatPay: 'WeChat Pay',
    wechatPayZh: '微信支付',
    alipay: 'Alipay',
    alipayZh: '支付宝',
    thankYou: 'Спасибо за вашу поддержку!',
    contactMe: 'Связаться со мной',
    getInTouch: 'Связь с Nyades',
    name: 'Имя',
    email: 'Почта',
    message: 'Сообщение',
    send: 'Отправить',
    joinDiscord: 'Присоединяйтесь к нашему Discord',
    close: 'Закрыть',
    ok: 'ОК',
  }
};

const state = reactive({
  locale: localStorage.getItem('locale') || 'en',
});

export function t(key: string, params?: Record<string, string | number>) {
  let str = (messages[state.locale] && messages[state.locale][key]) || (messages['en'] && messages['en'][key]) || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}

export function setLocale(locale: string) {
  state.locale = locale;
  localStorage.setItem('locale', locale);
}

export function getLocale() {
  return state.locale;
}

export default { t, setLocale, getLocale, state };
