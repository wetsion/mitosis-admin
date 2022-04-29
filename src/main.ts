import Vue, { DirectiveOptions } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import { AppModule } from '@/store/modules/app';
import i18n from '@/lang';
import SvgIcon from 'vue-svgicon';
import * as directives from '@/directives';
import '@/icons/components';
import '@/permission';
import '@/utils/error-log';
import '@/styles/element-variables.scss';
import '@/styles/index.scss';
import 'normalize.css';

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

Object.keys(directives).forEach(key => {
  Vue.directive(key, (directives as { [key: string ]: DirectiveOptions })[key])
})

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
