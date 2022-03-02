<template>
  <div class="menu-tree">
    <Tree 
      :data="menuList" 
      :show-checkbox="select" 
      @on-check-change="getSelectedNodes" 
      @on-select-change="handleNodeSelect"
    ></Tree>
  </div>
</template>

<script>
import { getMenuTree, getDeptTree } from '@/api/role';
import Vue from 'vue';
export default {
  name: 'vTree',
  props: {
    init: {     // 是否需要重新刷新列表
      type: Boolean,
      default: false,
    },
    type: {   // 菜单树还是部门树
      type: 'menu' | 'dept',
      default: 'menu',
    },
    ids: {  // 已选中的ids
      type: Array,
      default() {
        return [];
      },
    },
    select: {   // 是否展示checkbox
      type: Boolean,
      default: true,
    },
    expand: {   // 是否默认展开
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      menuList: [],
      selectedIds: [],
    }
  },
  created() {
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
      handler: async function (val) { 
        await this.getTreeData();
        // 递归层级
        function recrusionChildren(children) {
          if (children && children.length) {
            children.forEach(item => {
              if (val.includes(item.id)) {
                Vue.set(item, 'checked', true);   // item本身没有checked属性，需要使用set
              } else {
                Vue.set(item, 'checked', false);
              }
              recrusionChildren(item.children);
            })
          }
        }
        recrusionChildren(this.menuList);
      },
      deep: true
    }
  },
  methods: {
    async getTreeData() {
      try {
        const res = this.type === 'menu' ? await getMenuTree() : await getDeptTree();
        if (this.expand) {
          res.data.forEach(node => {
            this.setExpand(node);
          })
        }
        this.menuList = res.data;
      } catch (e) {
        console.log(e);
        this.$Message.error(e.msg);
      }
    },
    getSelectedNodes(nodes) {
      this.selectedIds = nodes.map(item => item.id);
      this.$emit('handleIdChange', this.selectedIds);
    },
    handleNodeSelect(node) {
      this.$emit('handleNodeSlect', node[0].id);
    },
    setExpand(node) {
      if(node.children && node.children.length) {
        node.expand = true;
        node.children.forEach(child => {
          this.setExpand(child);
        })
      }
    }
  }
}
</script>

<style scoped lang="less">

</style>