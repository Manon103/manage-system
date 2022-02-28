import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import '@/assets/css/main.css';
import '@/assets/css/common.less';
import { Message } from 'view-design';

import setPermission from './permission';
import { getSession } from './utils/storage';
import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';

// 开发者工具报错，等待官方修复
Vue.extend({}).constructor.prototype.version = Vue.version;

Vue.directive('permission', {
  bind: function (el, binding, vnode) {
    const { value } = binding;
    const menuPermission = getSession('menuPermission');
    if (!menuPermission.includes(value) && menuPermission[0] !== '*:*:*') {
      el.style.display = 'none';
    }
  }
})

if (getSession('permission')) {
  // 刷新页面时，添加路由
  router.onReady(() => {
    setPermission();
  })
}

const noLoginWhiteList = ['/login']
// 登录信息失效重新跳转到登录页
router.beforeEach((to, from, next) => {
  if (noLoginWhiteList.includes(to.path) || getSession('token')) {
    next()
  } else {
    Message.error('登录信息失效，请重新登录');
    next({
      path: '/login'
    });
  }
})

Vue.use(ViewUI);
Vue.use(mavonEditor);

Vue.prototype.axios = axios;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
