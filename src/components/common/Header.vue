<template>
  <div class="header flex">
    <div class="collapse" @click="closeSidebar">
      <img :src="require('@/assets/img/collapse.svg')">
    </div>
    <div class="user">
      <Dropdown @on-click="handleOperation">
        <a href="javascript:void(0)">
            <div class="user-header"></div>
        </a>
        <DropdownMenu slot="list">
            <DropdownItem name="profile">个人中心</DropdownItem>
            <DropdownItem name="logOut">退出登录</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<script>
import { clearSession } from '../../utils/storage';
export default {
  name: 'vheader',
  data() {
    return {
      isClosed: false
    }
  },
  methods: {
    closeSidebar() {
      this.isClosed = !this.isClosed;
      this.$emit('handelClose', this.isClosed);
    },
    handleOperation(name) {
      if (name === 'logOut') {
        clearSession();
        this.$router.push({
          path: '/login'
        })
      }
      if (name === 'profile') {
        this.$store.commit('SET_ACTIVE_TAB', name);
        const newItem = {
          label: '个人中心',
          path: name,
        }
        const tabList = this.$store.state.tabList;
        // 更新tabList
        this.$store.commit('SET_TABLIST', [...tabList, newItem])
        this.$router.push({
          name,
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  height: @height;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 7px #00000026;
  .collapse {
    height: 24px;
    img {
      width: 24px;
    }
  }
  .user {
    /deep/ .ivu-dropdown {
      display: flex;
    }
  }
  .user-header {
    width: 36px;
    height: 36px;
    background: #ccc;
    border-radius: 50%;
  }
}
</style>