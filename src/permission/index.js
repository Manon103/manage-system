import router from "../router";
import { getSession } from "../utils/storage";

// 获取当前用户权限，动态添加路由
export default function setPermission() {
  const permission = getSession('permission');
  permission.pop();
  // 目前模拟数据为全部路由，后续从接口获取
  permission.forEach(item => {
    // 把component替换为懒加载
    item.component = resolve => require(['@/views/common/Layout.vue'], resolve);
    let { children } = item;
    const recursionChildren = (children, parent) => {
      if (children && children.length) {
        children.forEach(child => {
          // 写在component回掉中会找不到module，于是先引入
          const comp = import(`@/views/${child.component}.vue`);
          child.component = () => comp;
          child.meta.parent = parent.name;
          recursionChildren(child.children, child);
        })
      }
    }
    recursionChildren(children, item);
  })
  console.log(permission);
  router.addRoutes(permission)
}
