import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const baseRoutes = [
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

export const menuRoutes = [
  {
    path: '/report-fill',
    name: 'reportFill',
    component: resolve => require(['@/views/report-fill/ReportFill.vue'], resolve),
    meta: {
      parent: 'report'
    }
  },
  {
    path: '/report-statistic',
    name: 'reportStatistic',
    component: resolve => require(['@/views/report-statistics/ReportStatistics.vue'], resolve),
    meta: {
      parent: 'report'
    }
  },
  {
    path: '/role-manage',
    name: 'roleManage',
    component: resolve => require(['@/views/role/Role.vue'], resolve),
    meta: {
      parent: 'system'
    }
  },
  {
    path: '/user-manage',
    name: 'userManage',
    component: resolve => require(['@/views/user/User.vue'], resolve),
    meta: {
      parent: 'system'
    }
  },
  {
    path: '/menu-manage',
    name: 'menuManage',
    component: resolve => require(['@/views/menu/Menu.vue'], resolve),
    meta: {
      parent: 'system'
    }
  },
  {
    path: '/department-manage',
    name: 'departmentManage',
    component: resolve => require(['@/views/department/Department.vue'], resolve),
    meta: {
      parent: 'system'
    }
  },
  {
    path: '/position-manage',
    name: 'positionManage',
    component: resolve => require(['@/views/position/Position.vue'], resolve),
    meta: {
      parent: 'system'
    }
  },
  {
    path: '/noticification',
    name: 'noticification',
    component: resolve => require(['@/views/noticification/Noticification.vue'], resolve),
    meta: {
      parent: 'system'
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  routes: baseRoutes,
});

export default router;
