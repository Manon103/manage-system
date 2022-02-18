<template>
  <div class="menu w-full">
    <div class="search-bar">
      <div class="mr-20">
        <span class="label">菜单名称</span>
        <Input v-model="searchParams.menuName" placeholder="请输入菜单名称" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">状态：</span>
        <Select
          clearable
          v-model="searchParams.status"
          style="width: 200px"
          @on-change="getData"
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
      <Button 
        type="primary" 
        icon="md-add" 
        ghost 
        v-permission="'system:menu:add'"
        @click="addMenu">
        新增
      </Button>
    </div>
    <div class='table-data'>
      <Spin fix v-if="loading"></Spin>
      <Table 
        :columns="columns" 
        :data="menuList" 
        row-key="menuId">
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
import { getList, add, update, deleteMenu } from '@/api/menu';
import { deleteRole } from '../../api/role';
export default {
  name: 'systemMenu',
  data() {
    const columns = [
      {
        title: '菜单名称',
        key: 'menuName'
      },
      {
        title: '图标',
        key: 'icon'
      },
      {
        title: '排序',
        key: 'orderNum'
      },
      {
        title: '权限标识',
        key: 'perms'
      },
      {
        title: '组件路径',
        key: 'component'
      },
      {
        title: '状态',
        key: 'status',
        slot: 'status',
      },
      {
        title: '创建时间',
        key: 'createTime'
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
        menuName: '',
        status: '',
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
      menuList: [],
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
    }
  },
  async created() {
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        let treeData = [];
        const root = res.data.find((item) => item.parentId === 0);
        if (root) {
          root._showChildren = true;
          root.label = root.menuName;
          root.value = root.menuId;
          treeData.push(root);
          res.data.forEach((menu, index) => {
            const firstLevelIds = treeData.map((item) => item.menuId);
            if (!firstLevelIds.includes(menu.menuId)) {
              const findReuslt = this.findParent(treeData, menu);
              if (!findReuslt) {
                res.data.splice(index, 1);
                res.data.push(menu);
              }
            }
          });
          this.menuList = treeData;
          if (this.init) {
            // 保存全部的树结构
            this.allTreeData = treeData;
            this.flatData = res.data;
          }
        }
      } catch (e) {
        this.$Message.error(res.msg);
      }
      this.loading = false;
    },
    addMenu() {
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
      };
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
            this.opType === "create" ? await add(params) : await update(params);
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
        await deleteMenu(ids);
        this.$Message.success('删除成功');
        this.getData();
      } catch (e) {
        this.$Message.error('删除失败');
      }
    },
    findParent(list, menu) {
      if (!menu.parentId) {
        return;
      }
      let result = false;
      const children = list[0].children;
      function recrusionChildren(children) {
        for (let item of children) {
          if (item.menuId === menu.parentId) {
            menu.label = menu.menuName;
            menu.value = menu.menuId;
            item.children.push(menu);
            result = true;
            break;
          }
          recrusionChildren(item.children);
        }
      }
      recrusionChildren(children);
      return result;
    },
  }
}
</script>

<style>

</style>