<template>
  <div class="sider-bar h-full">
    <div v-show="!isClosed" class='h-full'>
      <div class="sys-name">新奥新智</div>
      <Menu theme="dark" :active-name="activeName" @on-select="onSelect" :open-names="openNames" ref='expendMenu'>
        <template v-for="item in menuList">
          <Submenu :key="item.name" :name="item.name" v-if="item.subMenu">
            <template slot="title">
              <Icon :type="item.icon" />
              {{item.label}}
            </template>
            <MenuItem v-for="menu in item.subMenu" :key="menu.name" :name="menu.name">
              {{menu.label}}
            </MenuItem>
          </Submenu>
          <MenuItem :key="item.name" :name="item.name" v-else>
            <Icon :type="item.icon" />
            {{item.label}}
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
export default {
  name: 'siderBar',
  props: ['isClosed'],
  data() {
    return {
      activeName: 'home',
      menuList: [
        {
          name: 'home',
          label: '首页',
          icon: 'ios-home'
        },
        {
          name: 'report',
          label: '周报管理',
          icon: 'ios-menu',
          subMenu: [
            {
              name: 'reportFill',
              label: '周报填写',
              icon: '',
            },
            {
              name: 'reportStatistic',
              label: '周报统计',
              icon: '',
            },
          ]
        },
        {
          name: 'system',
          label: '系统管理',
          icon: 'ios-settings',
          subMenu: [
            {
              name: 'userManage',
              label: '用户管理',
              icon: '',
            },
            {
              name: 'roleManage',
              label: '角色管理',
              icon: '',
            },
            {
              name: 'menuManage',
              label: '菜单管理',
              icon: '',
            },
            {
              name: 'departmentManage',
              label: '部门管理',
              icon: '',
            },
            {
              name: 'positionManage',
              label: '岗位管理',
              icon: '',
            },
            {
              name: 'noticification',
              label: '通知公告',
              icon: '',
            },
          ]
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
    this.handleRouteChange();
    const item = this.findActiveItem(this.activeName);
    this.$store.commit('SET_TABLIST', [{
      label: item ? item.label : '',
      path: this.activeName,
    }])
  },
  methods: {
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
        label: activeItem ? activeItem.label : '',
        path: name,
      }
      // 更新tabList
      this.$store.commit('SET_TABLIST', [...tabList, newItem])
    },
    findActiveItem(name) {
      let activeItem;
      for (let menu of this.menuList) {
        if (!menu.subMenu) {
          if (menu.name === name) {
            activeItem = menu;
            break;
          }
        } else {
          const _item = menu.subMenu.find(item => item.name === name);
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
      height: 100%;
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
