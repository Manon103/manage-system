import { menuRoutes } from "../router";
import router from "../router";

// 获取当前用户权限，动态添加路由
export default function getPermission() {
  // 目前模拟数据为全部路由，后续从接口获取
  const routes = [
    {
      path: '/home',
      name: 'home',
      component: resolve => require(['@/views/common/Layout.vue'], resolve),
      children: menuRoutes
    },
  ]
  router.addRoutes(routes);
}