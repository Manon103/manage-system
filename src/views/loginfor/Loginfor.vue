<template>
  <div class="logininfor w-full">
    <div class="search-bar" v-permission="'monitor:logininfor:query'" style="margin-bottom: 0">
      <div class="mr-20 mb-20">
        <span class="label">登录地址：</span>
        <Input v-model="searchParams.ipaddr" placeholder="请输入登录地址" style="width: 200px" />
      </div>
      <div class="mr-20 mb-20">
        <span class="label">用户名称：</span>
        <Input v-model="searchParams.userName" placeholder="请输入用户名称" style="width: 200px" />
      </div>
      <div class="mr-20 mb-20">
        <span class="label">状态：</span>
        <Select
          clearable
          v-model="searchParams.status"
          style="width: 200px"
        >
          <Option
            v-for="item in statusList"
            :value="item.value"
            :key="item.value"
            >{{ item.label }}</Option
          >
        </Select>
      </div>
      <Button type="primary" class="mr-20 mb-20" @click="getData">搜索</Button>
      <Button class="mb-20" @click="resetParams">重置</Button>
    </div>
    <div class="mb-20">
      <template v-for="item in operationBtns">
        <Button 
          :type="item.type" 
          :icon="item.icon" 
          ghost 
          class="mr-10" 
          :key="item.key"
          v-permission="item.permission"
          @click="handleOperationClick(item.key)"
          :disabled="item.disabled">
          {{item.label}}
        </Button>
      </template>
    </div>
    <div class='table-data relative'>
      <Spin fix v-if="loading"></Spin>
      <Table 
        :columns="columns" 
        @on-selection-change="handleTableSelect"
        :data="logininforList" >
        <template slot-scope="{ row }" slot="status">
          <Badge color="green" text="成功" v-if="row.status === '0'" />
          <Badge color="red" text="失败" v-if="row.status === '1'" />
        </template>
      </Table>
       <Page 
        class="right mt-10" 
        :total="total" 
        @on-change="handlePageChange" 
        show-sizer 
        @on-page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script>
import { getList, clearLogInfo, deleteLogInfo } from '../../api/logininfor';
export default {
  name: 'logininfor',
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '访问编号',
        key: 'infoId',
      },
      {
        title: '用户名称',
        key: 'userName'
      },
      {
        title: '登录地址',
        key: 'ipaddr',
        width: 170
      },
      {
        title: '登录地点',
        key: 'loginLocation',
      },
      {
        title: '浏览器',
        key: 'browser'
      },
      {
        title: '操作系统',
        key: 'os',
      },
      {
        title: '操作信息',
        key: 'msg'
      },
      {
        title: '状态',
        key: 'status',
        slot: 'status',
      },
      {
        title: '登录日期',
        key: 'loginTime',
        width: 170
      }
    ];
    return {
      searchParams: {
        ipaddr: '',
        pageSize: 10,
        pageNum: 1,
        status: '',
        userName: ''
      },
      operationBtns: [
        {
          type: 'error',
          icon: 'md-close',
          label: '清空',
          key: 'clear',
          permission: 'monitor:logininfor:remove'
        },
        // {
        //   type: 'warning',
        //   icon: 'md-download',
        //   label: '导出',
        //   key: 'export',
        //   permission: 'monitor:logininfor:export'
        // },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'monitor:logininfor:remove'
        },
      ],
      statusList: [
        {
          label: "成功",
          value: 0,
        },
        {
          label: "失败",
          value: 1,
        },
      ],
      columns,
      logininforList: [],
      total: 0,
      loading: true,
      selectedData: [],
    }
  },
  watch: {
    selectedData: {
      handler(val) {
        this.$set(this.operationBtns[1], 'disabled', !val.length);
      },
      deep: true,
      immediate: true,
    }
  },
  async created() {
    this.getData();
  },
  methods: {
    handleOperationClick(key) {
      const map = {
        clear: 'clearLogInfo',
        export: 'exportLogInfo',
        delete: 'deleteLogInfo',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.logininforList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    exportLogInfo() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        ipaddr: '',
        pageNum: 1,
        status: '',
        userName: '',
        pageSize: this.searchParams.pageSize
      };
      this.getData();
    },
    handlePageSizeChange(size) {
      this.searchParams.pageSize = size;
      this.getData();
    },
    handlePageChange(page) {
      this.searchParams.pageNum = page;
      this.getData();
    },
    async clearLogInfo() {
      this.$Modal.confirm({
        title: '确认清空所有日志吗',
        closable: true,
        onOk: async() => {
          try {
            await clearLogInfo();
            this.$Message.success('清空成功');
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        },
      })
    },
    async deleteLogInfo() {
      this.$Modal.confirm({
        title: '确认删除该日志吗',
        closable: true,
        onOk: async() => {
          let ids = this.selectedData.map(item => item.infoId);
          try {
            await deleteLogInfo(ids);
            this.$Message.success('删除成功');
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        },
      })
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
  }
}
</script>

<style lang='less'>
.log-detail {
  div {
    margin-bottom: 12px;
    span:nth-child(1) {
      font-weight: bold;
      margin-right: 14px;
    }
  }
}
</style>