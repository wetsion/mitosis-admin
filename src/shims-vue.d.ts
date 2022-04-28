import VueRouter from 'vue-router';
import { Route } from 'vue-router';
import { Store } from 'vuex';

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter;
    $route: Route;
    $store: Store<any>;
  }
}

declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module 'element-ui/lib/locale/lang/*' {
  export const elementLocale: any
}

declare module 'store';
