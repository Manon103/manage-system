<template>
  <div class="lay-out w-full h-full flex">
    <sider-bar :isClosed="isClosed"></sider-bar>
    <div class="content" :style="{'width': isClosed ? 'calc(100% - 60px)' : 'calc(100% - 240px)'}">
      <v-header @handelClose="handelClose"></v-header>
      <tab-nav></tab-nav>
      <div class="inner-content w-full">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import VHeader from '../../components/common/Header.vue';
import SiderBar from '../../components/common/SiderBar.vue';
import TabNav from '../../components/common/TabNav.vue';
import {getList} from '../../api/api';
export default {
  name: 'ManageSystemLayout',
  components: {
    VHeader,
    SiderBar,
    TabNav,
  },
  data() {
    return {
      isClosed: false,
    };
  },

  mounted() {
    
  },

  async created() {

  },

  methods: {
    handelClose(isClosed) {
      this.isClosed = isClosed;
    }
  },
};
</script>

<style lang="less" scoped>
.lay-out {
  .content {
    width: calc(100% - 240px);
    .inner-content {
      padding: 12px;
    }
  }
}
</style>