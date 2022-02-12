<template>
  <div class="menu-tree">
    <Tree :data="menuList" show-checkbox @on-check-change="getSelectedNodes"></Tree>
  </div>
</template>

<script>
import { getMenuTree } from '@/api/role';
export default {
  name: 'vTree',
  data() {
    return {
      menuList: [],
      selectedIds: [],
    }
  },
  created() {
    this.getTreeData();
  },
  methods: {
    async getTreeData() {
      const res = await getMenuTree();
      if (res.code === 200) {
        this.menuList = res.data;
      } else {
        this.$Message.error(res.msg);
      }
    },
    getSelectedNodes(nodes) {
      this.selectedIds = nodes.map(item => item.id);
      this.$emit('handleIdChange', this.selectedIds);
    }
  }
}
</script>

<style scoped lang="less">

</style>