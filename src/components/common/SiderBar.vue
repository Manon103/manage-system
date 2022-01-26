<template>
  <div class="sider-bar h-full">
    <div v-show="!isClosed" class='h-full'>
      <div class="sys-name">新奥新智</div>
      <Menu theme="dark" :active-name="activeName" @on-select="onSelect" :open-names="openNames" ref='expendMenu'>
        <template v-for="item in menuList">
          <Submenu :key="item.name" :name="item.name" v-if="item.children">
            <template slot="title">
              <Icon :type="item.icon" />
              {{item.meta.title}}
            </template>
            <MenuItem v-for="menu in item.children" :key="menu.name" :name="menu.name">
              {{menu.meta.title}}
            </MenuItem>
          </Submenu>
          <MenuItem :key="item.name" :name="item.name" v-else>
            <Icon :type="item.icon" />
            {{item.meta.title}}
          </MenuItem>
        </template>
      </Menu>
    </div>
    <div v-show="isClosed" class='h-full'>
      <Menu theme="dark" :active-name="activeName" mode="vertical" width="60px" ref="asideMenu">
        <div class="sys-name" style="width: 60px">新</div>
        <template v-for="item in menuList">
          <MenuItem :key="item.name" :name="item.name">
            <Icon :type="item.icon" />
          </MenuItem>
        </template>
      </Menu>
    </div>
  </div>
</template>

<script>
import { getSession } from '../../utils/storage';
export default {
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
          },
          icon: 'ios-home'
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
    }
  },
  created() {
    this.menuList.push(...getSession('permission'));
    this.handleRouteChange();
    const item = this.findActiveItem(this.activeName);
    this.$store.commit('SET_TABLIST', [{
      label: item ? item.meta.title : '',
      path: this.activeName,
    }]);
  },
  methods: {
    // 路由变化时，菜单默认展开选中项
    handleRouteChange() {
      this.activeName = this.$route.name;
      this.openNames.push(this.$route.meta.parent);
      this.$nextTick(() => {
        this.$refs.expendMenu.updateActiveName();
        this.$refs.expendMenu.updateOpened();
      });
    },
    onSelect(name) {
      this.activeName = name;
      this.$router.push({
        name
      })
      // 激活tab选项
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
      let activeItem;
      for (let menu of this.menuList) {
        if (!menu.children) {
          if (menu.name === name) {
            activeItem = menu;
            break;
          }
        } else {
          const _item = menu.children.find(item => item.name === name);
          if (_item) {
            activeItem = _item;
            break;
          }
        }
      }
      return activeItem;
    }
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
