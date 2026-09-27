import { createApp, h } from 'vue';

import { RouterView } from 'vue-router';
import router from './router';
import { useBlocklyLocale } from '@/composables/locale';
import './styles/index.css';
import 'highlight.js/styles/github-dark.css';

// 全局初始化 locale，确保所有页面 ui() 可用
useBlocklyLocale().initLocale();

const app = createApp({ render: () => h(RouterView) });
app.use(router);
app.mount('#app');
