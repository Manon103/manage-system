<template>
  <div class="notice w-full">
    <div class="search-bar" v-permission="'system:notice:query'">
      <div class="mr-20">
        <span class="label">公告标题：</span>
        <Input v-model="searchParams.noticeTitle" placeholder="请输入公告标题" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">操作人员：</span>
        <Input v-model="searchParams.createBy" placeholder="请输入操作人员" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">类型：</span>
        <Select
          clearable
          v-model="searchParams.noticeType"
          style="width: 200px"
        >
          <Option
            v-for="item in typeList"
            :value="item.value"
            :key="item.value"
            >{{ item.label }}</Option
          >
        </Select>
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
        :data="noticeList" >
        <template slot-scope="{ row }" slot="status">
          <Badge color="green" text="正常" v-if="row.status === '0'" />
          <Badge color="red" text="停用" v-if="row.status === '1'" />
        </template>
        <template slot-scope="{ row }" slot="noticeType">
          <Tag color="orange" v-if="row.noticeType === '1'">通知</Tag>
          <Tag color="green" v-if="row.noticeType === '2'">公告</Tag>
        </template>
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'system:notice:edit'" @click="editNotice(row)">编辑</a>
            <Poptip confirm v-permission="'system:notice:remove'" title="确认删除该公告吗" @on-ok="deleteNotice(row)">
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
      width="680"
      :loading="true"
      :closable="false"
    >
      <Form
        :model="noticeForm"
        :rules="ruleValidate"
        :label-width="100"
        ref="noticeForm"
      >
        <FormItem label="公告标题:" prop="noticeTitle">
          <Input v-model="noticeForm.noticeTitle"></Input>
        </FormItem>
        <FormItem label="公告类型:" prop="noticeType">
          <Select
            clearable
            v-model="noticeForm.noticeType"
          >
            <Option
              v-for="item in typeList"
              :value="item.value"
              :key="item.value"
              >{{ item.label }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="状态:" prop="status">
          <i-switch v-model="noticeForm.status"> </i-switch>
        </FormItem>
        <FormItem label="内容:" prop="noticeContent">
          <v-editor :content="noticeForm.noticeContent" @changeEditorContent="handleContentChange"></v-editor>
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
import { getList, addNotice, updateNotice, deleteNotice } from '@/api/notice';
import MavonEditor from '../../components/MavonEditor.vue';
export default {
  name: 'notice',
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
        title: '序号',
        key: 'noticeId'
      },
      {
        title: '公告标题',
        key: 'noticeTitle',
        minWidth: 200
      },
      {
        title: '公告类型',
        key: 'noticeType',
        slot: 'noticeType',
      },
      {
        title: '创建者',
        key: 'createBy'
      },
      {
        title: '创建时间',
        key: 'createTime',
        width: 180,
      },
      {
        title: '状态',
        key: 'status',
        slot: 'status',
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ];
    const ruleValidate = {
      noticeTitle: [
        {
          required: true,
          message: "岗位名称不能为空",
          trigger: "blur",
        },
      ],
      noticeType: [
        {
          required: true,
          message: "岗位编码不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        noticeTitle: '',
        noticeType: '',
        createBy: '',
        pageSize: 10,
        pageNum: 1,
      },
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add',
          permission: 'system:notice:add'
        },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'system:notice:remove'
        },
      ],
      columns,
      noticeList: [],
      total: 0,
      typeList: [
        {
          label: '通知',
          value: '1',
        },
        {
          label: '公告',
          value: '2',
        },
      ],
      showModal: false,
      modalTitle: '添加公告',
      loading: true,
      noticeForm: {
        noticeTitle: '',
        noticeType: '',
        noticeContent: '',
        status: true,
      },
      ruleValidate,
      opType: 'create',
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
        add: 'addNotice',
        delete: 'deleteNotice',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.noticeList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addNotice() {
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '添加公告';
      this.$refs.noticeForm.resetFields();
      delete this.noticeForm.noticeId;
    },
    exportPost() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        noticeTitle: '',
        noticeType: '',
        createBy: '',
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
      this.$refs["noticeForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.noticeForm,
            status: this.noticeForm.status ? '0' : '1',
          };
          try {
            this.opType === "create" ? await addNotice(params) : await updateNotice(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    editNotice(data) {
      this.opType = 'edit';
      this.showModal = true;
      this.noticeForm = {
        ...data,
        status: data.status === '0' ? true : false,
      };
      this.modalTitle = '编辑公告';
    },
    async deleteNotice(data) {
      let ids = this.selectedData.map(item => item.noticeId);
      if (data) {
        ids = [data.noticeId];
      }
      try {
        await deleteNotice(ids);
        this.$Message.success('删除成功');
        this.getData();
        this.selectedData = [];
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    handleContentChange(content) {
      this.noticeForm.noticeContent = content;
    }
  }
}
</script>

<style>

</style>