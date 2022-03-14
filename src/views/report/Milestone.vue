<template>
  <div class="milestone w-full">
    <div class="search-bar" v-permission="'system:milestone:query'">
      <div class="mr-20">
        <span class="label">项目名称：</span>
        <Select
          clearable
          v-model="searchParams.projectId"
          style="width: 200px"
        >
          <Option
            v-for="item in projectList"
            :value="item.id"
            :key="item.id"
            >{{ item.projectName }}</Option
          >
        </Select>
      </div>
      <div class="mr-20">
        <span class="label">负责人：</span>
        <Input v-model="searchParams.milesManager" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">内容：</span>
        <Input v-model="searchParams.milesContent" style="width: 200px" />
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
        @on-selection-change="handleTableSelect"
        :data="milestoneList" 
        @on-row-click="showDetail">
        <template slot-scope="{ row }" slot="status">
          <Badge color="green" text="正常" v-if="row.status === '0'" />
          <Badge color="red" text="停用" v-if="row.status === '1'" />
        </template>
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'system:milestone:edit'" @click="(e) => editMilestone(e, row)">编辑</a>
            <a class="error-link" v-permission="'system:milestone:remove'" @click="(e) => deleteMilestone(e, row)">删除</a>
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
        :model="milestoneForm"
        :rules="ruleValidate"
        :label-width="150"
        ref="milestoneForm"
      >
        <FormItem label="项目名称:" prop="projectId">
          <Select
            v-model="milestoneForm.projectId"
            :disabled="isView"
          >
            <Option
              v-for="item in projectList"
              :value="item.id"
              :key="item.id"
              >{{ item.projectName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="里程碑开始时间:" prop="milesBegin">
          <DatePicker :disabled="isView" v-model="milestoneForm.milesBegin" type="date"></DatePicker>
        </FormItem>
        <FormItem label="里程碑结束时间:" prop="milesEnd">
          <DatePicker :disabled="isView" v-model="milestoneForm.milesEnd" type="date"></DatePicker>
        </FormItem>
        <FormItem label="里程碑负责人:" prop="milesManager">
          <Select
            v-model="milestoneForm.milesManager"
            :disabled="isView"
          >
            <Option
              v-for="item in managerList"
              :value="item.userName"
              :key="item.userName"
              >{{ item.nickName }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="里程碑内容:" prop="milesContent">
          <v-editor :editable="!isView" :defaultOpen="isView ? 'preview' : 'edit'" :content="milestoneForm.milesContent" @changeEditorContent="(content) => milestoneForm.milesContent=content"></v-editor>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="handleModalConfirmCancel">取消</Button>
        <Button type="primary" @click="handleModalConfirm">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { getList, addMilestone, updateMilestone, deleteMilestone } from '@/api/milestone';
import { getList as getProjectList } from '@/api/project';
import { getManagerList } from '@/api/user';
import MavonEditor from '../../components/MavonEditor.vue';

export default {
  name: 'milestone',
  components: {
    VEditor: MavonEditor,
  },
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '项目名称',
        key: 'projectName',
      },
      {
        title: '开始时间',
        key: 'milesBegin'
      },
      {
        title: '结束时间',
        key: 'milesEnd'
      },
      {
        title: '负责人',
        key: 'milesManager'
      },
      {
        title: '内容',
        key: 'milesContent',
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
          message: "项目不能为空",
          type: 'number',
          trigger: "blur",
        },
      ],
      milesBegin: [
        {
          required: true,
          message: "开始时间不能为空",
          trigger: "blur",
          type: 'date'
        },
      ],
      milesEnd: [
        {
          required: true,
          message: "结束时间不能为空",
          trigger: "blur",
          type: 'date'
        },
      ],
      milesManager: [
        {
          required: true,
          message: "负责人不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        projectId: '',
        milestoneContent: '',
        pageSize: 10,
        pageNum: 1,
        milesManager: '',
      },
      selectedData: [],
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add',
          permission: 'system:milestone:add'
        },
        {
          type: 'warning',
          icon: 'md-download',
          label: '导出',
          key: 'export',
          permission: 'system:milestone:export'
        },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'system:milestone:remove',
        },
      ],
      columns,
      projectList: [],
      milestoneList: [
        {
          projectName: 'aaa'
        }
      ],
      total: 0,
      showModal: false,
      modalTitle: '新增岗位',
      loading: true,
      milestoneForm: {
        projectId: '',
        milesBegin: '',
        milesEnd: '',
        milesManager: '',
        milesContent: '',
      },
      ruleValidate,
      opType: 'create',
      isView: false,
      managerList: [],
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
    this.getProjectInfo();
    this.getManagerList();
  },
  methods: {
    handleOperationClick(key) {
      const map = {
        add: 'addMilestone',
        export: 'exportMilestone',
        delete: 'deleteMilestone',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.milestoneList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addMilestone() {
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '新增里程碑';
      this.isView = false;
      this.$refs.milestoneForm.resetFields();
      delete this.milestoneForm.id;
    },
    exportMilestone() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        projectId: '',
        milestoneContent: '',
        pageNum: 1,
        milesManager: '',
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
      this.$refs["milestoneForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.milestoneForm,
            status: this.milestoneForm.status ? '0' : '1',
          };
          try {
            this.opType === "create" ? await addMilestone(params) : await updateMilestone(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    editMilestone(e, data) {
      e.stopPropagation();
      this.opType = 'edit';
      this.showModal = true;
      this.isView = false;
      this.milestoneForm = {
        ...data,
      };
      this.modalTitle = '编辑里程碑';
    },
    async deleteMilestone(e, data) {
      e && e.stopPropagation();
      this.$Modal.confirm({
        title: '确认删除该项目吗',
        closable: true,
        onOk: async() => {
          let ids = this.selectedData.map(item => item.id);
          if (data) {
            ids = [data.id];
          }
          try {
            await deleteMilestone(ids);
            this.$Message.success('删除成功');
            this.getData();
            this.selectedData = [];
          } catch (e) {
            this.$Message.error(e.msg);
          }
        },
      })
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    async getProjectInfo() {
      try {
        const res = await getProjectList({
          pageSize: 999,
          pageNum: 1,
        });
        this.projectList = res.rows;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async getManagerList() {
      try {
        const res = await getManagerList();
        this.managerList = res.rows;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async showDetail(data) {
      this.modalTitle = '项目详情',
      this.showModal = true;
      this.isView = true;
      this.milestoneForm = {...data};
    }
  }
}
</script>

<style>

</style>