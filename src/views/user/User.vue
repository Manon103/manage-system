<template>
  <div class="user h-full flex">
    <div class="tree h-full mr-20">
      <menu-tree type="dept" :select="false" :expand="true" @handleNodeSlect="selectTreeNode"></menu-tree>
    </div>
    <div class="user-content">
      <div class="search-bar" style="margin-bottom: 0" v-permission="'system:post:query'">
        <div class="mr-20 mb-20">
          <span class="label">用户名称：</span>
          <Input
            v-model="searchParams.userName"
            placeholder="请输入用户名称"
            style="width: 200px"
          />
        </div>
        <div class="mr-20 mb-20">
          <span class="label">手机号码：</span>
          <Input
            v-model="searchParams.phonenumber"
            placeholder="请输入手机号"
            style="width: 200px"
          />
        </div>
        <div class="mr-20 mb-20">
          <span class="label">状态：</span>
          <Select clearable v-model="searchParams.status" style="width: 200px">
            <Option
              v-for="item in statusList"
              :value="item.value"
              :key="item.value"
              >{{ item.label }}</Option
            >
          </Select>
        </div>
        <Button
          type="primary"
          class="mr-20"
          @click="getData"
          >搜索</Button
        >
        <Button class="mb-20" @click="resetParams">重置</Button
        >
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
            :disabled="item.disabled"
          >
            {{ item.label }}
          </Button>
        </template>
      </div>
      <div class="table-data relative">
        <Spin fix v-if="loading"></Spin>
        <Table
          :columns="columns"
          @on-selection-change="handleTableSelect"
          :data="userList"
        >
          <template slot-scope="{ row }" slot="status">
            <Badge color="green" text="正常" v-if="row.status === '0'" />
            <Badge color="red" text="停用" v-if="row.status === '1'" />
          </template>
          <template slot-scope="{ row }" slot="action" v-if="row.userId !== 1">
            <a
              class="mr-10"
              v-permission="'system:post:edit'"
              @click="editUser(row)"
              >编辑</a
            >
            <Poptip
              confirm
              v-permission="'system:post:remove'"
              title="确认删除该岗位吗"
              @on-ok="deleteUser(row)"
            >
              <a class="error-link">删除</a>
            </Poptip>
            <Dropdown
              trigger="click"
              class="ml-10"
              @on-click="(name) => handleDropClick(name, row)"
            >
              <a href="javascript:void(0)">
                更多
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem name="password">重置密码</DropdownItem>
                <DropdownItem name="role">分配角色</DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
    <Modal
      v-model="showModal"
      :title="modalTitle"
      width="600"
      :loading="true"
      :closable="false"
    >
      <Form
        :model="userForm"
        :rules="ruleValidate"
        :label-width="100"
        ref="userForm"
      >
        <div class="flex">
          <FormItem label="用户昵称:" prop="nickName" style="flex: 1">
            <Input v-model="userForm.nickName"></Input>
          </FormItem>
          <FormItem label="归属部门:" prop="deptId" style="flex: 1">
            <Cascader 
              change-on-select 
              :data="deptData" 
              v-model="userForm.deptId">
            </Cascader>
          </FormItem>
        </div>
        <div class="flex">
          <FormItem label="手机号码:" prop="phonenumber" style="flex: 1">
            <Input v-model="userForm.phonenumber"></Input>
          </FormItem>
          <FormItem label="邮箱:" prop="email" style="flex: 1">
            <Input v-model="userForm.email"></Input>
          </FormItem>
        </div>
        <div class="flex" v-if="opType === 'create'">
          <FormItem label="用户名称:" prop="userName" style="flex: 1">
            <Input v-model="userForm.userName"></Input>
          </FormItem>
          <FormItem label="用户密码:" prop="password" style="flex: 1">
            <Input type="password" password v-model="userForm.password"></Input>
          </FormItem>
        </div>
        <div class="flex">
          <FormItem label="用户性别:" prop="sex" style="flex: 1">
            <Select v-model="userForm.sex">
              <Option
                v-for="item in genderList"
                :value="item.value"
                :key="item.value"
                >{{ item.label }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="状态:" prop="status" style="flex: 1">
            <i-switch v-model="userForm.status"> </i-switch>
          </FormItem>
        </div>
        <div class="flex">
          <FormItem label="岗位:" prop="postIds" style="flex: 1">
            <Select multiple v-model="userForm.postIds">
              <Option
                v-for="item in postList"
                :value="item.postId"
                :key="item.postId"
                >{{ item.postName }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="角色:" prop="roleIds" style="flex: 1">
            <Select multiple v-model="userForm.roleIds">
              <Option
                v-for="item in roleList"
                :value="item.roleId"
                :key="item.roleId"
                >{{ item.roleName }}</Option
              >
            </Select>
          </FormItem>
        </div>
        <FormItem label="备注:" prop="remark">
          <Input type="textarea" v-model="userForm.remark"></Input>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" @click="showModal=false">取消</Button>
        <Button type="primary" @click="handleModalConfirm">确定</Button>
      </template>
    </Modal>
    <Modal
      v-model="showPassModal"
      title="修改密码"
      :loading="true"
      :closable="false"
    >
      <div class="mb-10">
        请输入新密码：
      </div>
      <Input v-model="newPassword"></Input>
      <template slot="footer">
        <Button type="text" @click="showPassModal=false">取消</Button>
        <Button type="primary" @click="editPassword">确定</Button>
      </template>
    </Modal>
    <Modal
      v-model="showAuthModal"
      title="分配角色"
      :loading="true"
      :closable="false"
    >
      <div class="mb-10">
        用户昵称：
        <Input disabled class="mt-10" v-model="curUser.nickName"></Input>
      </div>
      <div class="mb-10">
        登录账号：
        <Input disabled class="mt-10" v-model="curUser.userName"></Input>
      </div>
      <div class="mb-10">
        选择角色：
        <Select class="mt-10" multiple v-model="authRoles">
          <Option
            v-for="item in roleList"
            :value="item.roleId"
            :key="item.roleId"
            >{{ item.roleName }}</Option
          >
        </Select>
      </div>
      <template slot="footer">
        <Button type="text" @click="showAuthModal=false">取消</Button>
        <Button type="primary" @click="authUserRole">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import MenuTree from "../../components/MenuTree.vue";
import { getList, getAddUserInfo, addUser, updateUser, deleteUser, resetPassword, authRole } from '@/api/user';
import { initDeptTree, getAllParent } from '@/utils/tree';
import { getList as getDeptList, getDeptInfo } from "@/api/dept";
export default {
  name: "user",
  components: {
    MenuTree,
  },
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '用户编号',
        key: 'userId'
      },
      {
        title: '用户名称',
        key: 'userName'
      },
      {
        title: '用户昵称',
        key: 'nickName'
      },
      {
        title: '部门',
        key: 'deptName'
      },
      {
        title: '手机号',
        key: 'phonenumber'
      },
      {
        title: '状态',
        key: 'status',
        slot: 'status',
      },
      {
        title: '创建时间',
        width: 150,
        key: 'createTime'
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ];
    const ruleValidate = {
      nickName: [
        {
          required: true,
          message: "昵称不能为空",
          trigger: "blur",
        },
      ],
      userName: [
        {
          required: true,
          message: "用户名称不能为空",
          trigger: "blur",
        },
      ],
      password: [
        {
          required: true,
          message: "密码不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      operationBtns: [
        {
          type: "primary",
          icon: "md-add",
          label: "添加",
          key: "add",
          permission: "system:user:add",
        },
        {
          type: "error",
          icon: "md-close",
          label: "删除",
          key: "delete",
          permission: "system:user:remove",
        },
        {
          type: "warning",
          icon: "md-cloud-upload",
          label: "导入",
          key: "import",
          permission: "system:user:import",
        },
        {
          type: "warning",
          icon: "md-cloud-download",
          label: "导出",
          key: "export",
          permission: "system:user:export",
        },
      ],
      searchParams: {
        userName: "",
        phonenumber: "",
        status: "",
        pageSize: 10,
        pageNum: 1,
        deptId: null
      },
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
      genderList: [
        {
          label: '男',
          value: '0',
        },
        {
          label: '女',
          value: '1',
        },
        {
          label: '未知',
          value: '2',
        },
      ],
      postList: [],
      roleList: [],
      userList: [],
      selectedData: [],
      columns,
      loading: true,
      total: 0,
      modalTitle: '新建用户',
      showModal: false,
      userForm: {
        nickName: '',
        deptId: [],
        phonenumber: '',
        sex: '',
        status: true,
        postIds: [],
        roleIds: [],
        remark: '',
        password: '',
        userName: '',
        email: '',
      },
      ruleValidate,
      deptData: [],
      flatData: [],
      opType: 'create',
      showPassModal: false,
      newPassword: '',
      curUser: {},
      showAuthModal: false,
      authRoles: [],
    };
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
    this.getData();
    this.getDeptTree();
    this.getModalInfo();
  },
  methods: {
    resetParams() {
      this.searchParams = {
        userName: "",
        phonenumber: "",
        status: "",
        pageNum: 1,
        pageSize: this.searchParams.pageSize
      };
      this.getData();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.userList = res.rows.map(item => {
          return {
            ...item,
            deptName: item.dept.deptName,
          }
        });
        this.total = res.total;
      } catch (e) {
        console.log(e);
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    handleOperationClick(key) {
      const map = {
        add: "addUser",
        export: "exportUser",
        delete: "deleteUser",
        import: "importUser",
      };
      this[map[key]]();
    },
    addUser() {
      this.showModal = true;
      this.modalTitle = '新建用户';
      this.opType = 'create';
      this.$refs['userForm'].resetFields();
    },
    exportUser() {},
    importUser() {},
    async deleteUser(data) {
      try {
        let ids = [];
        if (data) {
          ids = [data.userId];
        } else {
          ids = this.selectedData.map(item => item.userId);
        }
        await deleteUser(ids);
        this.$Message.success("操作成功");
        this.getData();
        this.selectedData = [];
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    async editUser(data) {
      this.showModal = true;
      this.modalTitle = '编辑用户';
      this.opType = 'edit';
      try {
        const userInfo = await getAddUserInfo(data.userId);
        const { roleIds, postIds } = userInfo;
        this.userForm = {
          ...data,
          status: data.status === '0' ? true : false,
          roleIds,
          postIds,
          deptId: [],
        };
        const dept = await getDeptInfo(data.deptId);
        this.userForm.deptId = [...getAllParent(dept.data, 'edit', this.flatData), data.deptId];
      } catch (e) {
        console.log(e);
        this.$Message.error(e.msg);
      }
    },
    handlePageChange(page) {
      this.searchParams.pageNum = page;
      this.getData();
    },
    handlePageSizeChange(size) {
      this.searchParams.pageSize = size;
      this.getData();
    },
    handleDropClick(name, data) {
      this.curUser = data;
      if (name === "password") {
        this.showPassModal = true;
        this.newPassword = '';
      } else {
        this.authRoles = [];
        this.showAuthModal = true;
      }
    },
    selectTreeNode(id) {
      this.searchParams.deptId = id;
      this.getData();
    },
    handleModalConfirm() {
      this.$refs["userForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.userForm,
            status: this.userForm.status ? '0' : '1',
            deptId: this.userForm.deptId[this.userForm.deptId.length - 1],
          };
          try {
            this.opType === "create" ? await addUser(params) : await updateUser(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    async getDeptTree() {
      try {
        const res = await getDeptList();
        this.flatData = res.data;
        this.deptData = initDeptTree(res.data);
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async getModalInfo() {
      try {
        const res = await getAddUserInfo();
        this.postList = res.posts;
        this.roleList = res.roles;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async editPassword() {
      const pass = this.newPassword.trim();
      if (!pass || pass.length < 5) {
        this.$Message.warning('用户密码长度必须介于 5 和 20 之间');
        return;
      }
      try {
        await resetPassword(
          {
            password: this.newPassword,
            userId: this.curUser.userId
          }
        )
        this.$Message.success("操作成功");
        this.showPassModal = false;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async authUserRole() {
      try {
        await authRole(
          {
            roleIds: this.authRoles,
            userId: this.curUser.userId
          }
        )
        this.$Message.success("操作成功");
        this.showAuthModal = false;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    }
  },
};
</script>

<style scoped lang="less">
.user {
  .tree {
    width: 16%;
    height: 100%;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 12px;
  }
  .user-content {
    width: calc(84% - 20px);
    /deep/ .ivu-table-cell {
      padding: 0;
    }
  }
}
</style>