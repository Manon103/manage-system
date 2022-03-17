<template>
  <div class="logininfor w-full">
    <div class="search-bar" v-permission="'monitor:logininfor:query'" style="margin-bottom: 0">
      <div class="mr-20 mb-20">
        <span class="label">登录地址：</span>
        <Input v-model="searchParams.title" placeholder="请输入登录地址" style="width: 200px" />
      </div>
      <div class="mr-20 mb-20">
        <span class="label">用户名称：</span>
        <Input v-model="searchParams.operName" placeholder="请输入用户名称" style="width: 200px" />
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
          <Badge color="green" text="成功" v-if="row.status === 0" />
          <Badge color="red" text="失败" v-if="row.status === 1" />
        </template>
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'monitor:logininfor:view'" @click="viewLogInfo(row)">详细</a>
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
    <Modal
      v-model="showModal"
      title="操作日志详情"
      width="600"
      footer-hide
      class="log-detail"
    >
      <div>
        <span>操作模块</span>
        <span>{{curLog.title}}</span>
      </div>
      <div>
        <span>请求地址</span>
        <span>{{curLog.operUrl}}</span>
      </div>
      <div>
        <span>请求方式</span>
        <span>{{curLog.requestMethod}}</span>
      </div>
      <div>
        <span>登录信息</span>
        <span>{{curLog.operName}}/{{curLog.operIp}}/{{curLog.operLocation}}</span>
      </div>
      <div>
        <span>操作方法</span>
        <span>{{curLog.method}}</span>
      </div>
      <div>
        <span>请求参数</span>
        <span>{{curLog.operParam}}</span>
      </div>
      <div>
        <span>返回参数</span>
        <span>{{curLog.jsonResult}}</span>
      </div>
      <div>
        <span>操作状态</span>
        <span>{{curLog.status ? '失败' : '成功'}}</span>
      </div>
      <div>
        <span>操作时间</span>
        <span>{{curLog.operTime}}</span>
      </div>
    </Modal>
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
        title: '日志编号',
        key: 'operId',
      },
      {
        title: '系统模块',
        key: 'title'
      },
      {
        title: '操作类型',
        key: 'type'
      },
      {
        title: '请求方式',
        key: 'requestMethod'
      },
      {
        title: '操作人员',
        key: 'operName'
      },
      {
        title: '操作地址',
        key: 'operIp',
        width: 170
      },
      {
        title: '操作地点',
        key: 'operLocation'
      },
      {
        title: '状态',
        key: 'status',
        slot: 'status',
      },
      {
        title: '操作日期',
        key: 'operTime',
        width: 170
      },
      {
        title: '操作',
        slot: 'action',
      }
    ];
    const ruleValidate = {
      logininforName: [
        {
          required: true,
          message: "岗位名称不能为空",
          trigger: "blur",
        },
      ],
      logininforCode: [
        {
          required: true,
          message: "岗位编码不能为空",
          trigger: "blur",
        },
      ],
      logininforSort: [
        {
          required: true,
          message: "岗位排序不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        title: '',
        operName: '',
        businessType: '',
        pageSize: 10,
        pageNum: 1,
        status: '',
      },
      operationBtns: [
        {
          type: 'error',
          icon: 'md-close',
          label: '清空',
          key: 'clear',
          permission: 'monitor:logininfor:remove'
        },
        {
          type: 'warning',
          icon: 'md-download',
          label: '导出',
          key: 'export',
          permission: 'monitor:logininfor:export'
        },
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
      typeList: [
        {
          label: "新增",
          value: 1,
        },
        {
          label: "修改",
          value: 2,
        },
        {
          label: "删除",
          value: 3,
        },
        {
          label: "授权",
          value: 4,
        },
        // {
        //   label: "导出",
        //   value: 5,
        // },
        // {
        //   label: "导入",
        //   value: 6,
        // },
        {
          label: "强退",
          value: 7,
        },
        {
          label: "清空数据",
          value: 9,
        },
      ],
      showModal: false,
      modalTitle: '新增岗位',
      loading: true,
      logininforForm: {
        logininforName: '',
        logininforCode: '',
        logininforSort: '',
        status: true,
        remark: '',
      },
      ruleValidate,
      opType: 'create',
      selectedData: [],
      curLog: {},
    }
  },
  watch: {
    selectedData: {
      handler(val) {
        this.$set(this.operationBtns[2], 'disabled', !val.length);
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
        this.logininforList = res.rows.map(item => {
          const typeMap = {
            1: '新增',
            2: '修改',
            3: '删除',
            4: '授权',
            7: '强退',
            9: '清空数据'
          }
          return {
            ...item,
            type: typeMap[item.businessType],
          }
        });
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addLogInfo() {
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '新增岗位';
      this.$refs.logininforForm.resetFields();
      delete this.logininforForm.logininforId;
    },
    exportLogInfo() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        logininforCode: '',
        logininforName: '',
        status: '',
        pageNum: 1,
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
    handleModalConfirmCancel() {
      this.showModal = false;
    },
    handleModalConfirm() {
      this.$refs["logininforForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.logininforForm,
            status: this.logininforForm.status ? '0' : '1',
          };
          try {
            this.opType === "create" ? await addLogInfo(params) : await updateLogInfo(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    viewLogInfo(data) {
      this.curLog = {
        ...data,
        operParam: JSON.parse(data.operParam),
        jsonResult: JSON.parse(data.jsonResult)
      };
      this.showModal = true;
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
          let ids = this.selectedData.map(item => item.operId);
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