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
          @click="handleOperationClick(item.key)">
          {{item.label}}
        </Button>
      </template>
    </div>
    <div class='table-data relative'>
      <Spin fix v-if="loading"></Spin>
      <Table 
        :columns="columns" 
        @on-selection-change="handleTableSelect"
        :data="milestoneList" >
        <template slot-scope="{ row }" slot="status">
          <Badge color="green" text="正常" v-if="row.status === '0'" />
          <Badge color="red" text="停用" v-if="row.status === '1'" />
        </template>
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'system:milestone:edit'" @click="editMilestone(row)">编辑</a>
            <Poptip confirm v-permission="'system:milestone:remove'" title="确认删除该岗位吗" @on-ok="deleteMilestone(row)">
              <a class="error-link">删除</a>
            </Poptip>
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
        :label-width="100"
        ref="milestoneForm"
      >
        <FormItem label="岗位名称:" prop="milestoneName">
          <Input v-model="milestoneForm.milestoneName"></Input>
        </FormItem>
        <FormItem label="岗位编码:" prop="milestoneCode">
          <Input v-model="milestoneForm.milestoneCode"></Input>
        </FormItem>
        <FormItem label="岗位顺序:" prop="milestoneSort">
          <Input v-model="milestoneForm.milestoneSort"></Input>
        </FormItem>
        <FormItem label="部门状态:" prop="status">
          <i-switch v-model="milestoneForm.status"> </i-switch>
        </FormItem>
        <FormItem label="备注:" prop="remark">
          <Input v-model="milestoneForm.remark"></Input>
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
export default {
  name: 'milestone',
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '项目名称',
        key: 'projectName'
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
      milestoneName: [
        {
          required: true,
          message: "岗位名称不能为空",
          trigger: "blur",
        },
      ],
      milestoneCode: [
        {
          required: true,
          message: "岗位编码不能为空",
          trigger: "blur",
        },
      ],
      milestoneSort: [
        {
          required: true,
          message: "岗位排序不能为空",
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
          permission: 'system:milestone:remove'
        },
      ],
      columns,
      projectList: [],
      total: 0,
      statusList: [
        {
          label: "正常",
          value: "0",
        },
        {
          label: "停用",
          value: "1",
        },
      ],
      showModal: false,
      modalTitle: '新增岗位',
      loading: true,
      milestoneForm: {
        milestoneName: '',
        milestoneCode: '',
        milestoneSort: '',
        status: true,
        remark: '',
      },
      ruleValidate,
      opType: 'create',
      selectedData: [],
    }
  },
  async created() {
    this.getData();
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
      this.modalTitle = '新增岗位';
      this.$refs.milestoneForm.resetFields();
      delete this.milestoneForm.milestoneId;
    },
    exportMilestone() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        milestoneCode: '',
        milestoneName: '',
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
    editMilestone(data) {
      this.opType = 'edit';
      this.showModal = true;
      this.milestoneForm = {
        milestoneName: data.milestoneName,
        milestoneCode: data.milestoneCode,
        milestoneSort: data.milestoneSort,
        status: data.status === '0' ? true : false,
        remark: data.remark,
        milestoneId: data.milestoneId,
      };
      this.modalTitle = '编辑岗位';
    },
    async deleteMilestone(data) {
      let ids = this.selectedData.map(item => item.milestoneId);
      if (data) {
        ids = [data.milestoneId];
      }
      try {
        await deleteMilestone(ids);
        this.$Message.success('删除成功');
        this.getData();
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
  }
}
</script>

<style>

</style>