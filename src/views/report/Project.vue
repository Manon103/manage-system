<template>
  <div class="project w-full">
    <div class="search-bar mb-0" v-permission="'report:project:query'">
      <div class="mr-20 mb-20">
        <span class="label">业务域名称：</span>
        <Select
          clearable
          v-model="searchParams.productId"
          style="width: 200px"
        >
          <Option
            v-for="item in productList"
            :value="item.id"
            :key="item.id"
            >{{ item.productName }}</Option
          >
        </Select>
      </div>
      <div class="mr-20 mb-20">
        <span class="label">项目名称：</span>
        <Input v-model="searchParams.projectName" style="width: 200px" />
      </div>
      <div class="mr-20 mb-20">
        <span class="label">项目编码：</span>
        <Input v-model="searchParams.projectCode" style="width: 200px" />
      </div>
      <div class="mr-20 mb-20">
        <span class="label">负责人：</span>
        <Input v-model="searchParams.projectManager" style="width: 200px" />
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
        :data="projectList"
        @on-row-click="showProductDetail">
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'report:project:edit'" @click="(e) => editProject(e, row)">编辑</a>
            <a 
              v-permission="'report:project:remove'" 
              class="error-link" 
              @click="(e) => deleteProject(e, row)">
              删除
            </a>
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
      width="800"
      :loading="true"
      :closable="false"
      class="project-modal"
    >
      <Form
        :model="projectFrom"
        :rules="ruleValidate"
        :label-width="120"
        ref="projectFrom"
      >
        <Divider plain orientation="left">业务域信息</Divider>
        <FormItem label="业务域名称:" prop="productId">
          <Select
            clearable
            v-model="projectFrom.productId"
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
        <Divider plain orientation="left">项目信息</Divider>
        <div class="flex">
          <FormItem label="项目编码:" prop="projectCode" style="flex: 1">
            <Input v-model="projectFrom.projectCode" :disabled="isView"></Input>
          </FormItem>
          <FormItem label="项目负责人:" prop="projectManager" style="flex: 1">
            <Input v-model="projectFrom.projectManager" :disabled="isView"></Input>
          </FormItem>
        </div>
        <FormItem label="项目名:" prop="projectName">
          <Input v-model="projectFrom.projectName" :disabled="isView"></Input>
        </FormItem>
        <FormItem label="内容:" prop="projectContent">
          <v-editor :editable="!isView" :defaultOpen="isView ? 'preview' : 'edit'" :content="projectFrom.projectContent" @changeEditorContent="(content) => projectFrom.projectContent=content"></v-editor>
        </FormItem>
        <div class="flex">
          <FormItem label="项目开始时间:" prop="projectBegin" style="flex: 1">
            <DatePicker :disabled="isView" v-model="projectFrom.projectBegin" type="date"></DatePicker>
          </FormItem>
          <FormItem label="项目结束时间:" prop="projectEnd" style="flex: 1">
            <DatePicker :disabled="isView" v-model="projectFrom.projectEnd" type="date"></DatePicker>
          </FormItem>
        </div>
        <Divider plain orientation="left">里程碑信息</Divider>
        <div class="mb-10" v-if="!isView">
          <Button class="mr-10" size="small" type="primary" @click="addMilestone">添加</Button>
          <Button size="small" :disabled="!selectedMilestone.length" @click="deleteMilestone">删除</Button>
        </div>
        <Table 
          :columns="mileColumns" 
          @on-selection-change="handleMilestoneSelect"
          :data="projectFrom.milestones">
          <template slot-scope="{ row, index }" slot="milesManager">
            <span v-if="isView">{{row['milesManager']}}}</span>
            <Input v-model="projectFrom.milestones[index]['milesManager']"></Input>
          </template>
          <template slot-scope="{ row, index }" slot="milesBegin">
            <span v-if="isView">{{row['milesBegin']}}}</span>
            <DatePicker v-else v-model="projectFrom.milestones[index]['milesBegin']" type="date"></DatePicker>
          </template>
          <template slot-scope="{ row, index }" slot="milesEnd">
            <span v-if="isView">{{row['milesEnd']}}}</span>
            <DatePicker v-else v-model="projectFrom.milestones[index]['milesEnd']" type="date"></DatePicker>
          </template>
          <template slot-scope="{ row, index }" slot="milesContent">
            <span v-if="isView">{{row['milesContent']}}}</span>
            <Input v-else type="textarea" :autosize="true" v-model="projectFrom.milestones[index]['milesContent']"></Input>
          </template>
        </Table>
      </Form>
      <template slot="footer">
        <Button type="text" @click="handleModalConfirmCancel">取消</Button>
        <Button type="primary" @click="handleModalConfirm">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { getList, addProject, updateProject, deleteProject, getProjectInfo } from '@/api/project';
import { getList as getProductList } from '@/api/product';
import MavonEditor from '../../components/MavonEditor.vue';

export default {
  name: 'project',
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
        title: '业务域',
        key: 'productName',
      },
      {
        title: '项目名称',
        key: 'projectName'
      },
      {
        title: '项目编码',
        key: 'projectCode'
      },
      {
        title: '负责人',
        key: 'projectManager'
      },
      {
        title: '内容',
        key: 'projectContent'
      },
      {
        title: '开始时间',
        key: 'projectBegin'
      },
      {
        title: '结束时间',
        key: 'projectEnd'
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ];
    const ruleValidate = {
      projectName: [
        {
          required: true,
          message: "岗位名称不能为空",
          trigger: "blur",
        },
      ],
      projectCode: [
        {
          required: true,
          message: "岗位编码不能为空",
          trigger: "blur",
        },
      ],
      projectManager: [
        {
          required: true,
          message: "岗位排序不能为空",
          trigger: "blur",
        },
      ],
    };
    const mileColumns = [
      {
        type: 'selection',
        width: 60,
        align: 'center',
      },
      {
        title: '序号',
        key: 'index',
        width: 70,
      },
      {
        title: '负责人',
        key: 'milesManager',
        slot: 'milesManager',
      },
      {
        title: '开始时间',
        key: 'milesBegin',
        slot: 'milesBegin',
      },
      {
        title: '结束时间',
        key: 'milesEnd',
        slot: 'milesEnd',
      },
      {
        title: '内容',
        slot: 'milesContent',
        key: 'milesContent',
      },
    ];
    return {
      productList: [],
      searchParams: {
        productId: '',
        projectCode: '',
        projectName: '',
        projectManager: '',
        pageSize: 10,
        pageNum: 1,
      },
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add',
          permission: 'report:project:add'
        },
        {
          type: 'warning',
          icon: 'md-download',
          label: '导出',
          key: 'export',
          permission: 'report:project:export'
        },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'report:project:remove'
        },
      ],
      columns,
      projectList: [],
      total: 0,
      showModal: false,
      modalTitle: '新增岗位',
      loading: false,
      projectFrom: {
        projectName: '',
        projectCode: '',
        projectManager: '',
        projectContent: '',
        productId: '',
        projectBegin: '',
        projectEnd: '',
        milestones: [],
      },
      ruleValidate,
      opType: 'create',
      selectedData: [],
      mileColumns,
      isView: false,
      selectedMilestone: [],
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
    this.getProjectList();
    this.getData();
  },
  methods: {
    async getProjectList() {
      try {
        const res = await getProductList(this.searchParams);
        this.productList = res.rows;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    handleOperationClick(key) {
      const map = {
        add: 'addProject',
        export: 'exportProject',
        delete: 'deleteProject',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.projectList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addProject() {
      this.showModal = true;
      this.isView = false;
      this.opType = 'create';
      this.modalTitle = '新增业务域';
      this.$refs.projectFrom.resetFields();
      this.projectFrom.milestones = [];
      delete this.projectFrom.id;
    },
    exportProject() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        productId: '',
        projectCode: '',
        projectName: '',
        projectManager: '',
        pageSize: this.searchParams.pageSize,
        pageNum: 1,
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
      this.$refs["projectFrom"].validate(async (valid) => {
        if (valid) {
          try {
            this.opType === "create" ? await addProject(this.projectFrom) : await updateProject(this.projectFrom);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    async editProject(e, data) {
      e.stopPropagation();
      this.opType = 'edit';
      this.showModal = true;
      this.modalTitle = '编辑业务域';
      this.isView = false;
      try {
        const res = await getProjectInfo(data.id);
        this.projectFrom = {
          ...res.data,
          productId: res.data.product.id,
        };
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async deleteProject(e, data) {
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
            await deleteProject(ids);
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
    addMilestone() {
      const { length } = this.projectFrom.milestones;
      this.projectFrom.milestones.push({
        index: length + 1,
        milesBegin: '',
        milesContent: '',
        milesEnd: '',
        milesManager: '',
      })
    },
    deleteMilestone() {
      const ids = this.selectedMilestone.map(item => item.index);
      this.projectFrom.milestones = this.projectFrom.milestones.filter(item => !ids.includes(item.index));
    },
    handleMilestoneSelect(data) {
      this.selectedMilestone = data;
    },
    async showProductDetail(data) {
      this.modalTitle = '项目详情',
      this.showModal = true;
      this.isView = true;
      try {
        const res = await getProjectInfo(data.id);
        this.projectFrom = {
          ...res.data,
          productId: res.data.product.id,
        };
      } catch (e) {
        this.$Message.error(e.msg);
      }
    }
  }
}
</script>

<style lang='less'>
.project-modal {
  .ivu-divider-horizontal.ivu-divider-with-text-left .ivu-divider-inner-text {
    color: #2d8cf0;
  }
}
</style>

<style scoped lang="less">
.project {
  /deep/ .ivu-table-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>