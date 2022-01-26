<template>
  <div>
    <template v-for="item in menuList">
      <Submenu :key="item.name" :name="item.name" v-if="item.children">
        <template slot="title">
          <svg class="icon" aria-hidden="true">
            <use :xlink:href="`#icon-${item.meta.icon}`"></use>
          </svg>
          {{item.meta.title}}
        </template>
        <!-- 递归调用组件 -->
        <v-menu :menuList="item.children" :key="item.name"></v-menu>  
      </Submenu>
      <MenuItem :key="item.name" :name="item.name" v-else>
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="`#icon-${item.meta.icon}`"></use>
        </svg>
        {{item.meta.title}}
      </MenuItem>
    </template>
  </div>
</template>

<script>
export default {
  name: 'vMenu',
  props: {
    menuList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
}
</script>

<style>

</style>