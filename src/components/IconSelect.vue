<template>
  <div class="icon-select">
    <Select v-model="icon" style="width:200px" @on-change="handleIconSelect">
      <template v-for="item in iconArray">
        <Option :value="item" :label="item" :key="item">
          <svg class="icon" aria-hidden="true">
            <use :xlink:href="`#icon-${item}`"></use>
          </svg>
          {{item}}
        </Option>
      </template>
    </Select>
  </div>
</template>

<script>
export default {
  name: 'iconSelect',
  props: ['value'],
  data() {
    return {
      iconArray: [
        'input',
        'skill',
        'education',
        'clipboard',
        'code',
        'build',
        'form',
        'tool',
        'logininfor',
        'swagger',
        'monitor',
        'home',
        'server',
        'edit',
        'message',
        'online',
        'job',
        'log',
        'dict',
        'redis',
        'druid',
        'post',
        'system',
        'user',
        'peoples',
        'tree-table',
        'tree',
      ],
      icon: '',
    }
  },
  watch: {
    value(val) {
      this.icon = val;
    }
  },
  methods: {
    handleIconSelect() {
      this.$emit('input', this.icon);
    }
  }
}
</script>

<style scoped lang="less">
.icon-select {
  /deep/ .ivu-select-dropdown-list {
    display: flex;
    flex-wrap: wrap;
  }
  /deep/ .ivu-select-item {
    width: 50%;
  }
}
</style>