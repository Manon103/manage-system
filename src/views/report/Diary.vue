<template>
  <div class="report-fill w-full">
    <div class="search-bar" v-permission="'report:diary:query'">
      <div class="mr-20">
        <span class="label">填写日期：</span>
        <DatePicker type="date" placeholder="请选择填写日期" style="width: 200px" v-model="searchParams.writeDate"></DatePicker>
      </div>
      <div class="mr-20">
        <span class="label">填写人：</span>
        <Input v-model="searchParams.createBy" placeholder="请输入填写人" style="width: 200px" />
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
      <Table :columns="columns" :data="reportList">
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'report:diary:edit'" @click="editReport(row)">编辑</a>
            <a class="error-link" v-permission="'report:diary:delete'" @click="deleteReport(row)">删除</a>
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
          >
            <Option
              v-for="item in productList"
              :value="item.productId"
              :key="item.productId"
              >{{ item.productName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="项目名称:" prop="projectId">
          <Select
            v-model="diaryForm.projectId"
            style="width: 200px"
          >
            <Option
              v-for="item in projectList"
              :value="item.projectId"
              :key="item.projectId"
              >{{ item.projectName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="里程碑:" prop="productId">
          <Select
            v-model="diaryForm.productId"
            style="width: 200px"
          >
            <Option
              v-for="item in productList"
              :value="item.productId"
              :key="item.productId"
              >{{ item.productName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="填写日期:" prop="writeDate">
          <DatePicker type="date" v-model="diaryForm.writeDate"></DatePicker>
        </FormItem>
        <FormItem label="周报内容:" prop="content">
          <v-editor :content="diaryForm.content" @changeEditorContent="handleContentChange"></v-editor>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="showModal=false">取消</Button>
        <Button type="primary" @click="handleModalConfirm">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { getList, addDiary, updateDiary } from '@/api/diary';
import { getList as getProjectList } from '@/api/project';
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
        key: 'date'
      },
      {
        title: '项目名称',
        key: 'name'
      },
      {
        title: '周报内容',
        key: 'content'
      },
      {
        title: '填写人',
        key: 'author'
      },
      {
        title: '第几周/年',
        key: 'week'
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ];
    const ruleValidate = {
      projectId: [
        {
          required: true,
          message: "项目名称不能为空",
          trigger: "blur",
        },
      ],
      writeDate: [
        {
          required: true,
          message: "填写日期不能为空",
          trigger: "blur",
          type: 'date'
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
        {
          type: 'warning',
          icon: 'md-download',
          label: '导出',
          key: 'export',
          permission: 'report:diary:export'
        },
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
        writeDate: '',
        content: '',
      },
      ruleValidate,
      opType: 'create',
      projectList: [],
      productList: [],
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
  created() {
    const { user } = getSession('userInfo');
    this.searchParams.createBy = user.userName;
    this.getData();
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
        const res = await getList(this.searchParams);
        console.log(res);
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addReport() {
      this.$refs.diaryForm.resetFields();
      this.getProjectList();
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '新建周报';
      delete this.diaryForm.reportId;
    },
    async getProjectList() {
      try {
        const res = await getProjectList({
          pageSize: 999,
          pageNum: 1
        });
        console.log(res);
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    editReport(data) {
      this.getProjectList();
      this.showModal = true;
      this.opType = 'edit';
      this.modalTitle = '编辑周报';
      this.diaryForm = data;
    },
    exportReport() {
      console.log('export');
    },
    deleteReport() {
      console.log('delete');
    },
    resetParams() {
      this.searchParams = {
        writeDate: '',
        createBy: '',
        projectName: '',
        pageNum: 1,
        pageSize: this.searchParams.pageSize
      };
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
      this.$refs["diaryForm"].validate(async (valid) => {
        if (valid) {
          try {
            this.opType === "create" ? await addDiary(this.diaryForm) : await updateDiary(this.diaryForm);
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