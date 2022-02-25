<template>
  <div class="tab-nav">
    <Tabs type="card" @on-tab-remove="handleTabRemove" :value="activeTab" @on-click="handleTabClick">
        <TabPane 
          :closable="!(item.path === 'home' && index === 0)" 
          :label="item.label" v-for="(item, index) in tabList" 
          :key="item.path" 
          :name="item.path">
        </TabPane>
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
      if (this.activeTab === name) {
        if (this.tabList.length) {
          this.handleTabClick(this.tabList[0].path);
        } else {
          // 关闭最后一个默认跳转到home
          this.handleTabClick('home');
          this.$store.commit('SET_TABLIST', [{
            label: '首页',
            path: 'home'
          }]);
        }
      }
    },
    handleTabClick(name) {
      this.$store.commit('SET_ACTIVE_TAB', name);
      this.$router.push({
        name
      });
    }
  }
}
</script>

<style lang="less" scoped>
.tab-nav {
  padding: 4px;
  height: 34px;
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