<template>
  <div class="header flex">
    <div class="collapse" @click="closeSidebar">
      <img :src="require('@/assets/img/collapse.svg')">
    </div>
    <div class="user">
      <Dropdown>
        <a href="javascript:void(0)">
            <div class="user-header"></div>
        </a>
        <DropdownMenu slot="list">
            <DropdownItem>驴打滚</DropdownItem>
            <DropdownItem>炸酱面</DropdownItem>
            <DropdownItem disabled>豆汁儿</DropdownItem>
            <DropdownItem>冰糖葫芦</DropdownItem>
            <DropdownItem divided>北京烤鸭</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<script>
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
    img {
      width: 24px;
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