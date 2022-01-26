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
            <DropdownItem name="logOut">退出登录</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<script>
import { clear } from '../../utils/storage';
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
        clear();
        this.$router.push({
          path: '/login'
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