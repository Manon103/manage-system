<template>
  <div class="post w-full">
    <div class="search-bar" v-permission="'system:post:query'">
      <div class="mr-20">
        <span class="label">岗位编码：</span>
        <Input v-model="searchParams.postCode" placeholder="请输入岗位编码" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">岗位名称：</span>
        <Input v-model="searchParams.postName" placeholder="请输入岗位名称" style="width: 200px" />
      </div>
      <div class="mr-20">
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
        :data="postList" >
        <template slot-scope="{ row }" slot="status">
          <Badge color="green" text="正常" v-if="row.status === '0'" />
          <Badge color="red" text="停用" v-if="row.status === '1'" />
        </template>
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'system:post:edit'" @click="editPost(row)">编辑</a>
            <Poptip confirm v-permission="'system:post:remove'" title="确认删除该岗位吗" @on-ok="deletePost(row)">
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
        :model="postForm"
        :rules="ruleValidate"
        :label-width="100"
        ref="postForm"
      >
        <FormItem label="岗位名称:" prop="postName">
          <Input v-model="postForm.postName"></Input>
        </FormItem>
        <FormItem label="岗位编码:" prop="postCode">
          <Input v-model="postForm.postCode"></Input>
        </FormItem>
        <FormItem label="岗位顺序:" prop="postSort">
          <Input v-model="postForm.postSort"></Input>
        </FormItem>
        <FormItem label="部门状态:" prop="status">
          <i-switch v-model="postForm.status"> </i-switch>
        </FormItem>
        <FormItem label="备注:" prop="remark">
          <Input v-model="postForm.remark"></Input>
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
import { getList, addPost, updatePost, deletePost } from '@/api/post';
export default {
  name: 'post',
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '岗位编号',
        key: 'postId'
      },
      {
        title: '岗位编码',
        key: 'postCode'
      },
      {
        title: '岗位名称',
        key: 'postName'
      },
      {
        title: '岗位排序',
        key: 'postSort'
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
      postName: [
        {
          required: true,
          message: "岗位名称不能为空",
          trigger: "blur",
        },
      ],
      postCode: [
        {
          required: true,
          message: "岗位编码不能为空",
          trigger: "blur",
        },
      ],
      postSort: [
        {
          required: true,
          message: "岗位排序不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        postCode: '',
        postName: '',
        status: '',
        pageSize: 10,
        pageNum: 1,
      },
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add',
          permission: 'system:post:add'
        },
        {
          type: 'warning',
          icon: 'md-download',
          label: '导出',
          key: 'export',
          permission: 'system:post:export'
        },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'system:post:remove'
        },
      ],
      columns,
      postList: [],
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
      postForm: {
        postName: '',
        postCode: '',
        postSort: '',
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
        add: 'addPost',
        export: 'exportPost',
        delete: 'deletePost',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.postList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addPost() {
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '新增岗位';
      this.$refs.postForm.resetFields();
      delete this.postForm.postId;
    },
    exportPost() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        postCode: '',
        postName: '',
        status: '',
        pageSize: 10,
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
      this.$refs["postForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.postForm,
            status: this.postForm.status ? '0' : '1',
          };
          try {
            this.opType === "create" ? await addPost(params) : await updatePost(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    editPost(data) {
      this.opType = 'edit';
      this.showModal = true;
      this.postForm = {
        postName: data.postName,
        postCode: data.postCode,
        postSort: data.postSort,
        status: data.status === '0' ? true : false,
        remark: data.remark,
        postId: data.postId,
      };
      this.modalTitle = '编辑岗位';
    },
    async deletePost(data) {
      let ids = this.selectedData.map(item => item.postId);
      if (data) {
        ids = [data.postId];
      }
      try {
        await deletePost(ids);
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