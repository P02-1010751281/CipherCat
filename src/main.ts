import { createApp, h } from 'vue';

import * as Blockly from 'blockly/core';

import { RouterView } from 'vue-router';
import router from './router';
import { useBlocklyLocale } from '@/composables/locale';
import './styles/index.css';
import 'highlight.js/styles/github.css';

import './blocks';
import './generators/javascript';
import './generators/python';

// 全局初始化 locale，确保所有页面 ui() 可用
useBlocklyLocale().initLocale();

console.log('Blockly Crypto Editor v2.0.0');
console.log('Blockly版本:', Blockly.VERSION);

const app = createApp({ render: () => h(RouterView) });
app.use(router);
app.mount('#app');
