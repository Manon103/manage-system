<template>
  <div class="report-fill w-full">
    <div class="search-bar" v-permission="'report:diary:query'">
      <div class="mr-20">
        <span class="label">填写日期：</span>
        <DatePicker type="date" placeholder="请选择填写日期" style="width: 200px" v-model="searchParams.writeDate"></DatePicker>
      </div>
      <div class="mr-20">
        <span class="label">项目名称：</span>
        <Input v-model="searchParams.projectName" placeholder="请输入项目名称" style="width: 200px" />
      </div>
      <Button type="primary" class="mr-20" @click="getData">搜索</Button>
      <Button @click="resetParams">重置</Button>
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
        :data="reportList" 
        @on-row-click="showDetail"
        @on-selection-change="handleTableSelect">
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'report:diary:edit'" @click="(e) => editReport(e, row)">编辑</a>
            <a class="error-link" v-permission="'report:diary:delete'" @click="(e) => deleteReport(e, row)">删除</a>
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
      :title="modalTitle"
      width="600"
      :loading="true"
      :closable="false"
    >
      <Form
        :model="diaryForm"
        :rules="ruleValidate"
        :label-width="100"
        ref="diaryForm"
      >
        <FormItem label="业务域:" prop="productId">
          <Select
            v-model="diaryForm.productId"
            style="width: 200px"
            :disabled="isView"
          >
            <Option
              v-for="item in productList"
              :value="item.id"
              :key="item.id"
              >{{ item.productName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="项目名称:" prop="projectId">
          <Select
            v-model="diaryForm.projectId"
            style="width: 200px"
            label-in-value
            :disabled="isView"
            @on-change="handleProjectSelect"
          >
            <Option
              v-for="item in projectList"
              :value="item.id"
              :key="item.id"
              >{{ item.projectName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="里程碑:" prop="milestoneId">
          <Select
            v-model="diaryForm.milestoneId"
            style="width: 200px"
            :disabled="isView"
          >
            <Option
              v-for="item in milestoneList"
              :value="item.id"
              :key="item.id"
              >{{ item.milesContent }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="填写日期:" prop="writeDate">
          <DatePicker :disabled="isView" type="date" @on-change="handleDateChange" v-model="diaryForm.writeDate"></DatePicker>
        </FormItem>
        <FormItem label="周报内容:" prop="content">
          <v-editor :editable="!isView" :defaultOpen="isView ? 'preview' : 'edit'" :content="diaryForm.content" @changeEditorContent="handleContentChange"></v-editor>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button v-if="!isView" type="text" @click="showModal=false">取消</Button>
        <Button type="primary" @click="handleModalConfirm">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { getList, addDiary, updateDiary, deleteDiary } from '@/api/diary';
import { getList as getProjectList } from '@/api/project';
import { getList as getProductList } from '@/api/product';
import { getList as getMilestoneList } from '@/api/milestone';
import { getSession } from '@/utils/storage';
import MavonEditor from '../../components/MavonEditor.vue';
export default {
  name: 'daily',
  components: {
    vEditor: MavonEditor,
  },
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '填写日期',
        key: 'writeDate'
      },
      {
        title: '项目名称',
        key: 'projectName'
      },
      {
        title: '周报内容',
        key: 'content'
      },
      {
        title: '填写人',
        key: 'createBy'
      },
      {
        title: '第几周/年',
        key: 'weekOfYear'
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ];
    const ruleValidate = {
      productId: [
        {
          required: true,
          message: "业务域不能为空",
          type: 'number',
          trigger: "blur",
        },
      ],
      projectId: [
        {
          required: true,
          message: "项目名称不能为空",
          type: 'number',
          trigger: "blur",
        },
      ],
      milestoneId: [
        {
          required: true,
          message: "里程碑不能为空",
          type: 'number',
          trigger: "blur",
        },
      ],
      content: [
        {
          required: true,
          message: "内容不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        writeDate: '',
        createBy: '',
        projectName: '',
        pageSize: 10,
        pageNum: 1,
      },
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add',
          permission: 'report:diary:add'
        },
        // {
        //   type: 'warning',
        //   icon: 'md-download',
        //   label: '导出',
        //   key: 'export',
        //   permission: 'report:diary:export'
        // },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'report:diary:delete'
        },
      ],
      columns,
      reportList: [],
      total: 0,
      loading: true,
      showModal: false,
      modalTitle: '新增周报',
      diaryForm: {
        projectId: '',
        productId: '',
        writeDate: '',
        content: '',
        milestoneId: '',
        projectName: '',
      },
      ruleValidate,
      opType: 'create',
      projectList: [],
      productList: [],
      userName: '',
      milestoneList: [],
      selectedData: [],
      isView: false,
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
  created() {
    const { user } = getSession('userInfo');
    this.userName = user.userName;
    this.getData();
    this.getProjectList();
    this.getProductList();
    this.getMilestoneList();
  },
  methods: {
    handleOperationClick(key) {
      const map = {
        add: 'addReport',
        export: 'exportReport',
        delete: 'deleteReport',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        this.searchParams.createBy = this.userName;
        const res = await getList(this.searchParams);
        this.reportList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addReport() {
      this.$refs.diaryForm.resetFields();
      this.showModal = true;
      this.opType = 'create';
      this.isView = false;
      this.modalTitle = '新建周报';
      delete this.diaryForm.reportId;
    },
    async getProjectList() {
      try {
        const res = await getProjectList({
          pageSize: 999,
          pageNum: 1
        });
        this.projectList = res.rows;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async getProductList() {
      try {
        const res = await getProductList({
          pageSize: 999,
          pageNum: 1
        });
        this.productList = res.rows;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async getMilestoneList() {
      try {
        const res = await getMilestoneList({
          pageSize: 999,
          pageNum: 1
        });
        this.milestoneList = res.rows;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async editReport(e, data) {
      e && e.stopPropagation();
      this.isView = false;
      this.showModal = true;
      this.opType = 'edit';
      this.modalTitle = '编辑周报';
      this.diaryForm = {...data};
    },
    exportReport() {
      console.log('export');
    },
    deleteReport(e, data) {
      e && e.stopPropagation();
      this.$Modal.confirm({
        title: '确认删除该周报吗',
        closable: true,
        onOk: async() => {
          let ids = this.selectedData.map(item => item.id);
          if (data) {
            ids = [data.id];
          }
          try {
            await deleteDiary(ids);
            this.$Message.success('删除成功');
            this.getData();
            this.selectedData = [];
          } catch (e) {
            this.$Message.error(e.msg);
          }
        },
      })
    },
    resetParams() {
      this.searchParams = {
        writeDate: '',
        projectName: '',
        pageNum: 1,
        pageSize: this.searchParams.pageSize,
        createBy: this.userName,
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
    handleModalConfirm() {
      if (this.isView) {
        this.showModal = false;
        return;
      }
      this.$refs["diaryForm"].validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              ...this.diaryForm,
              createBy: this.userName,
            }
            this.opType === "create" ? await addDiary(data) : await updateDiary(data);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    handleContentChange(content) {
      this.diaryForm.content = content;
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    handleProjectSelect(val) {
      val && (this.diaryForm.projectName = val.label);
    },
    async showDetail(data) {
      this.modalTitle = '周报详情',
      this.showModal = true;
      this.isView = true;
      this.diaryForm = {...data};
    },
    handleDateChange(val) {
      this.diaryForm.writeDate = val;
    }
  }
}
</script>

<style scoped lang='less'>
.report-fill {
  /deep/ .ivu-select-dropdown {
    z-index: 1501;
  }
}

</style>