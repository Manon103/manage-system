import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
}

const baseRoutes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/home',
    name: 'home',
    component: resolve => require(['@/views/common/Layout.vue'], resolve),
    meta: {
      icon: 'home'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: resolve => require(['@/views/login/Login.vue'], resolve),
  },
];

const router = new VueRouter({
  mode: 'history',
  routes: baseRoutes,
});

export default router;
