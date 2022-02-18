<template>
  <div class="menu-tree">
    <Tree :data="menuList" show-checkbox @on-check-change="getSelectedNodes"></Tree>
  </div>
</template>

<script>
import { getMenuTree, getDeptTree } from '@/api/role';
import Vue from 'vue';
export default {
  name: 'vTree',
  props: ['init', 'type', 'ids'],
  data() {
    return {
      menuList: [],
      selectedIds: [],
    }
  },
  created() {
    console.log(this.ids);
    this.getTreeData();
  },
  watch: {
    init(val) {
      if (val) {
        // 初始化tree数据及勾选项
        this.getTreeData();
      }
    },
    ids: {
      handler: function (val) { 
        function recrusionChildren(children) {
          if (children && children.length) {
            children.forEach(item => {
              if (val.includes(item.id)) {
                Vue.set(item, 'checked', true);
                item.checked = true;
              } else {
                Vue.set(item, 'checked', true);
                item.checked = false;
              }
              recrusionChildren(children.children);
            })
          }
        }
        recrusionChildren(this.menuList);
        console.log(this.menuList);
      },
      deep: true
    }
  },
  methods: {
    async getTreeData() {
      try {
        const res = this.type === 'menu' ? await getMenuTree() : await getDeptTree();
        this.menuList = res.data;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      // function recrusionChildren(children) {
      //   if (children && children.length) {
      //     children.forEach(item => {
      //       // if (val.includes(item.id)) {
      //         item.checked = true;
      //       // }
      //       recrusionChildren(children.children);
      //     })
      //   }
      // }
      // recrusionChildren(this.menuList);
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