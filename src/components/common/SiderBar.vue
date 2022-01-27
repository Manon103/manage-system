<template>
  <div class="sider-bar h-full">
    <div v-show="!isClosed" class='h-full'>
      <div class="sys-name">新奥新智</div>
      <Menu theme="dark" :active-name="activeName" @on-select="onSelect" :open-names="openNames" accordion ref='expendMenu'>
        <v-menu :menuList="menuList"></v-menu>
      </Menu>
    </div>
    <div v-show="isClosed" class='h-full'>
      <Menu theme="dark" :active-name="activeName" mode="vertical" width="60px" ref="asideMenu">
        <div class="sys-name" style="width: 60px">新</div>
        <template v-for="item in menuList">
          <MenuItem :key="item.name" :name="item.name">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="`#icon-${item.meta.icon}`"></use>
            </svg>
          </MenuItem>
        </template>
      </Menu>
    </div>
  </div>
</template>

<script>
import { getSession } from '../../utils/storage';
import VMenu from './VMenu.vue';
export default {
  components: { VMenu },
  name: 'siderBar',
  props: ['isClosed'],
  data() {
    return {
      activeName: 'home',
      menuList: [
        {
          name: 'home',
          meta: {
            title: '首页',
            icon: 'home',
          },
        },
      ],
      openNames: [],
    }
  },
  watch: {
    isClosed(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.asideMenu.updateActiveName();
        })
      }
    },
    $route() {
      this.handleRouteChange();
    },
  },
  created() {
    this.menuList.push(...getSession('permission'));
    this.handleRouteChange();
  },
  methods: {
    // 路由变化时，菜单默认展开选中项
    handleRouteChange() {
      this.activeName = this.$route.name;
      // 刷新页面默认打开路由对应的菜单
      this.openNames = this.$router.currentRoute.matched.map(item => item.name);
      this.$nextTick(() => {
        this.$refs.expendMenu.updateActiveName();
        this.$refs.expendMenu.updateOpened();
      });
    },
    onSelect(name) {
      this.activeName = name;
      this.$router.push({
        name,
      });
      // 激活tabNav选项
      const tabList = this.$store.state.tabList;
      this.$store.commit('SET_ACTIVE_TAB', name);
      const activeInTab = tabList.find(item => item.path === name);
      if (activeInTab) {
        return;
      }
      const activeItem = this.findActiveItem(name);
      const newItem = {
        label: activeItem ? activeItem.meta.title : '',
        path: name,
      }
      // 更新tabList
      this.$store.commit('SET_TABLIST', [...tabList, newItem])
    },
    findActiveItem(name) {
      let menu;
      // 递归查找选中的项的完整数据
      function recrusionChild(children) {
        if (children && children.length) {
          for (let child of children) {
            if (child.name === name) {
              menu = child;
              break;
            }
            recrusionChild(child.children);
          }
        }
      }
      recrusionChild(this.menuList);
      return menu;
    },
  }
};
</script>

<style lang="less" scoped>
  .sider-bar {
    /deep/ .ivu-menu {
      height: calc(100% - 50px);
      overflow-y: auto;
    }
    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    .sys-name {
      width: 240px;
      background: #515a6d;
      color: #fff;
      height: @height;
      font-size: 14px;
      font-weight: 600;
      line-height: 50px;
      text-align: center;
    }
  }
</style>
