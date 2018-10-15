import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'

import App from './App.vue';

Vue.use(BootstrapVue);

// Official Japan Government sources: https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html
new Vue({
  el: '#app',
  template: '<App/>',
  components: {
    App
  }
});