<template>
  <div class="sider-bar h-full">
    <div v-show="!isClosed" class='h-full'>
      <div class="sys-name">新奥新智</div>
      <Menu theme="dark" :active-name="activeName" @on-select="onSelect">
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
              name: 'fill',
              label: '周报填写',
              icon: '',
            },
            {
              name: 'statistic',
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
              name: 'user',
              label: '用户管理',
              icon: '',
            },
            {
              name: 'role',
              label: '角色管理',
              icon: '',
            },
            {
              name: 'menu',
              label: '菜单管理',
              icon: '',
            },
            {
              name: 'department',
              label: '部门管理',
              icon: '',
            },
            {
              name: 'post',
              label: '岗位管理',
              icon: '',
            },
            {
              name: ' announcement',
              label: '通知公告',
              icon: '',
            },
          ]
        },
      ],
    }
  },
  watch: {
    isClosed(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.asideMenu.updateActiveName();
        })
      }
    }
  },
  methods: {
    onSelect(name) {
      this.activeName = name;
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
