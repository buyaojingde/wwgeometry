import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
// require("pixi-layers");
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

Vue.config.productionTip = false;
PIXI.utils.skipHello();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
