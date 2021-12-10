<template>
  <div class="lay-out w-full h-full flex">
    <sider-bar :isClosed="isClosed"></sider-bar>
    <div class="content" :style="{'width': isClosed ? 'calc(100% - 60px)' : 'calc(100% - 240px)'}">
      <v-header @handelClose="handelClose"></v-header>
      <div class="inner-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import VHeader from '../../components/common/Header.vue';
import SiderBar from '../../components/common/SiderBar.vue';
export default {
  name: 'ManageSystemLayout',
  components: {
    VHeader,
    SiderBar,
  },
  data() {
    return {
      isClosed: false,
    };
  },

  mounted() {
    
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
  }
}
</style>