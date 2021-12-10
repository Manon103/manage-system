import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: resolve => require(['@/views/common/Layout.vue'], resolve),
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
