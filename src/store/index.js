import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tabList: [],
    activeTab: '',
  },
  mutations: {
    SET_TABLIST(state, list) {
      state.tabList = list;
    },
    SET_ACTIVE_TAB(state, tab) {
      state.activeTab = tab;
    }
  },
  actions: {
  },
  modules: {
  }
})
