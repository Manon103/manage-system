import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
// 路由重复点击报错
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
    redirect: 'index',
    component: resolve => require(['@/views/common/Layout.vue'], resolve),
    meta: {
      icon: 'home',
      title: '首页'
    },
    children: [
      {
        path: '/index',
        name: 'home',
        component: resolve => require(['@/views/home/Home.vue'], resolve),
        meta: {
          icon: 'home',
          title: '首页'
        },
      },
      {
        path: 'profile',
        name: 'profile',
        component: resolve => require(['@/views/user/Profile.vue'], resolve),
        meta: {
          title: '个人中心'
        }
      },
    ]
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
