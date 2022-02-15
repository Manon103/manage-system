import router from "../router";
import { getSession, setSession } from "../utils/storage";
import { getInfo } from '@/api/login';
import { Message } from "view-design";

// 获取当前用户权限，动态添加路由
export default async function setPermission() {
  const permission = getSession('permission');
  // 目前模拟数据为全部路由，后续从接口获取
  permission.forEach(item => {
    // 把component替换为懒加载
    item.component = () => import('@/views/common/Layout.vue');
    let { children } = item;
    const recursionChildren = (children, parent) => {
      if (children && children.length) {
        children.forEach(child => {
          if (!child.children) {
            // 写在component回掉中会找不到module，于是先引入
            const comp = import(`@/views/${child.component}.vue`);
            child.component = () => comp;
          } else {
            // 父级不设置组件需要用render渲染router-view
            child.component = { render: h => h('router-view') };
          }
          child.meta.parent = parent.name;
          recursionChildren(child.children, child);
        })
      }
    }
    recursionChildren(children, item);
  })
  router.addRoutes(permission);
  getMenuPermission();
}

async function getMenuPermission() {
  const userInfoRes = await getInfo();
  if (userInfoRes.code === 200) {
    setSession('menuPermission', userInfoRes.permissions);
  } else {
    Message.error(userInfoRes.msg);
  }
}
