<template>
  <div class="role w-full">
    <div class="search-bar">
      <div class="mr-20 mb-10">
        <span class="label">角色名称：</span>
        <Input
          v-model="searchParams.roleName"
          placeholder="请输入角色名称"
          style="width: 200px"
        />
      </div>
      <div class="mr-20">
        <span class="label">权限字符：</span>
        <Input
          v-model="searchParams.roleKey"
          placeholder="请输入权限字符"
          style="width: 200px"
        />
      </div>
      <div class="mr-20">
        <span class="label">角色状态：</span>
        <Select
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
      <div class="mr-20">
        <span class="label">创建时间：</span>
        <DatePicker
          type="daterange"
          placement="bottom-end"
          placeholder="选择时间"
          style="width: 200px"
          v-model="searchParams.timeRange"
        >
        </DatePicker>
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
          @click="handleOperationClick(item.key)"
        >
          {{ item.label }}
        </Button>
      </template>
    </div>
    <div class="table-data relative">
      <Spin fix v-if="loading"></Spin>
      <Table :columns="columns" :data="roleList">
        <template slot-scope="{ row, index }" slot="status">
          <i-switch v-model="row.status" />
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a class="mr-10">编辑</a>
          <a class="error-link">删除</a>
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
      :loading="loading"
    >
      <Form
        :model="roleForm"
        :rules="ruleValidate"
        :label-width="100"
        class="roleForm"
        ref="roleForm"
      >
        <FormItem label="角色名称:" prop="roleName">
          <Input v-model="roleForm.roleName"></Input>
        </FormItem>
        <FormItem label="权限字符:" prop="roleKey">
          <Input v-model="roleForm.roleKey"></Input>
        </FormItem>
        <FormItem label="显示顺序:" prop="roleSort">
          <Input v-model="roleForm.roleSort"></Input>
        </FormItem>
        <FormItem label="状态:">
          <i-switch v-model="roleForm.status"> </i-switch>
        </FormItem>
        <FormItem label="备注:">
          <Input v-model="roleForm.remark"></Input>
        </FormItem>
        <FormItem label="菜单权限:">
          <menu-tree @handleIdChange="getMenuIds"></menu-tree>
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
import { getList, addRole } from "../../api/role";
import MenuTree from "../../components/MenuTree.vue";
export default {
  name: "role",
  data() {
    const columns = [
      {
        type: "selection",
        width: 60,
        align: "center",
      },
      {
        title: "角色编号",
        key: "roleId",
      },
      {
        title: "角色名称",
        key: "roleName",
      },
      {
        title: "权限字符",
        key: "roleKey",
      },
      {
        title: "显示顺序",
        key: "roleSort",
      },
      {
        title: "角色状态",
        slot: "status",
      },
      {
        title: "创建时间",
        key: "createTime",
        width: 180,
      },
      {
        title: "操作",
        slot: "action",
        width: 150,
      },
    ];
    const ruleValidate = {
      name: [
        {
          required: true,
          message: "角色名称不能为空",
          trigger: "blur",
        },
      ],
      permission: [
        {
          required: true,
          message: "权限字符不能为空",
          trigger: "blur",
        },
      ],
      order: [
        {
          required: true,
          message: "显示顺序不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        roleName: "",
        roleKey: "",
        status: "",
        timeRange: "",
        pageNum: 2,
        pageSize: 10,
      },
      statusList: [
        {
          value: "all",
          label: "全部",
        },
        {
          value: "0",
          label: "正常",
        },
        {
          value: "1",
          label: "停用",
        },
      ],
      operationBtns: [
        {
          type: "primary",
          icon: "md-add",
          label: "添加",
          key: "add",
        },
        {
          type: "warning",
          icon: "md-download",
          label: "导出",
          key: "export",
        },
        {
          type: "error",
          icon: "md-close",
          label: "删除",
          key: "delete",
        },
      ],
      columns,
      roleList: [],
      total: 0,
      loading: false,
      showModal: false,
      modalTitle: "新增角色",
      roleForm: {
        roleName: "",
        roleKey: "",
        roleSort: "",
        status: true,
        remark: "",
      },
      ruleValidate,
      loading: true,
      menuIds: [],
    };
  },
  components: {
    MenuTree,
  },
  created() {
    this.getData();
  },
  methods: {
    handleOperationClick(key) {
      const map = {
        add: "addRole",
        export: "exportRole",
        delete: "deleteRole",
      };
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      if (this.searchParams.status === "all") {
        this.searchParams.status = "";
      }
      const res = await getList(this.searchParams);
      if (res.code === 200) {
        this.roleList = res.rows.map((item) => {
          return {
            ...item,
            status: !parseInt(item.status, 10),
          };
        });
        this.total = res.total;
      } else {
        this.$Message.error(res.msg);
      }
      this.loading = false;
    },
    addRole() {
      this.showModal = true;
      console.log("add");
    },
    exportRole() {
      console.log("export");
    },
    deleteRole() {
      console.log("delete");
    },
    resetParams() {
      this.searchParams = {
        roleName: "",
        roleKey: "",
        status: "",
        timeRange: "",
        pageNum: 1,
        pageSize: 10,
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
      this.$refs['roleForm'].validate(async (valid) => {
        if (valid) {
          const res = await addRole({
            menuIds: this.menuIds,
            ...this.roleForm,
            status: this.roleForm.status ? '0' : '1',
          });
          if (res.code === 200) {
            this.$Message.success('新增成功');
            this.showModal = false;
            this.$refs['roleForm'].resetFields();
            this.getData();
          } else {
            this.$Message.error(res.msg);
          }
        }
      });
    },
    handleModalConfirmCancel() {
      this.$refs['roleForm'].resetFields();
    },
    getMenuIds(ids) {
      this.menuIds = ids;
    },
  },
};
</script>

<style lang="less">
.roleForm {
  .ivu-form-item:last-child {
    .ivu-form-item-content {
      height: 200px;
      overflow: auto;
    }
  }
}
</style>

<style scoped lang="less">
</style>