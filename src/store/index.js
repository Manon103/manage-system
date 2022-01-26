import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate';
Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    tabList: [],  // 页面顶部选中的菜单列表
    activeTab: '',
    openNames: [],
  },
  mutations: {
    SET_TABLIST(state, list) {
      state.tabList = list;
    },
    SET_ACTIVE_TAB(state, tab) {
      state.activeTab = tab;
    },
    SET_OPEN_NAMES(state, list) {
      state.openNames = list;
    }
  },
  actions: {
  },
  modules: {
  }
})
