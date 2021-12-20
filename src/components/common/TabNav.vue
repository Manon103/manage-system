<template>
  <div class="tab-nav">
    <Tabs type="card" closable @on-tab-remove="handleTabRemove" :value="activeTab">
        <TabPane :label="item.label" v-for="item in tabList" :key="item.path" :name="item.path"></TabPane>
    </Tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'tabNav',
  data() {
    return {
      tab0: true,
      tab1: true,
    }
  },
  computed: {
    ...mapState([
      'tabList',
      'activeTab'
    ])
  },
  methods: {
    handleTabRemove(name) {
      const removeIndex = this.tabList.findIndex(item => item.path === name);
      this.tabList.splice(removeIndex, 1);
      this.$store.commit('SET_TABLIST', this.tabList);
    }
  }
}
</script>

<style lang="less" scoped>
.tab-nav {
  padding: 4px;
  background: #f9f9f9;
  border-bottom: 1px solid #dcdee2;
  box-shadow: 0 2px 7px #3e3e3e26;
}
/deep/ .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar {
  .ivu-tabs-tab {
    font-size: 12px;
    margin-right: 6px;
    height: 24px;
    padding: 2px 6px 2px 4px;
    border-bottom: 1px solid #dcdee2;
    border-radius: 4px;
    .ivu-tabs-close {
      height: 20px;
      font-size: 20px;
      margin-left: -6px;
    }
  }
  .ivu-tabs-nav-container {
    height: 26px;
  }
}
/deep/ .ivu-tabs-bar {
  border: 0;
  margin-bottom: 0;
}
</style>