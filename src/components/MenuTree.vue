<template>
  <div class="menu-tree">
    <Tree :data="menuList" show-checkbox @on-check-change="getSelectedNodes"></Tree>
  </div>
</template>

<script>
import { getMenuTree, getDeptTree } from '@/api/role';
export default {
  name: 'vTree',
  props: ['init', 'type'],
  data() {
    return {
      menuList: [],
      selectedIds: [],
    }
  },
  created() {
    this.getTreeData();
    console.log(this.init);
  },
  watch: {
    init(val) {
      if (val) {
        // 初始化tree数据及勾选项
        this.getTreeData();
      }
    }
  },
  methods: {
    async getTreeData() {
      const res = this.type === 'menu' ? await getMenuTree() : await getDeptTree();
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