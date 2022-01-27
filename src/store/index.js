import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tabList: [],  // 页面顶部选中的菜单列表
    activeTab: '',
  },
  mutations: {
    SET_TABLIST(state, list) {
      state.tabList = list;
    },
    SET_ACTIVE_TAB(state, tab) {
      state.activeTab = tab;
    },
  },
  actions: {
  },
  modules: {
  }
})
