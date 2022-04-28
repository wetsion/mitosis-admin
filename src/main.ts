import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import { AppModule } from '@/store/modules/app';
import i18n from '@/lang';
import SvgIcon from 'vue-svgicon';

Vue.config.productionTip = false;

Vue.use(ElementUI, {
  size: AppModule.size, // Set element-ui default size
  i18n: (key: string, value: string) => i18n.t(key, value)
})

Vue.use(SvgIcon, {
  tagName: 'svg-icon',
  defaultWidth: '1em',
  defaultHeight: '1em'
})

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
