<template>
  <div class="role w-full">
    <template v-if="!showDistributeRole">
      <div class="search-bar" v-permission="'system:role:query'">
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
          :data="roleList"
          @on-selection-change="handleTableSelect"
        >
          <template slot-scope="{ row }" slot="status">
            <i-switch v-model="row.status" />
          </template>
          <template
            slot-scope="{ row }"
            slot="action"
            v-if="row.roleId !== 1"
          >
            <a class="mr-10" v-permission="'system:role:edit'" @click="editRole(row)">编辑</a>
            <Poptip confirm v-permission="'system:role:remove'" title="确认删除该角色吗" @on-ok="deleteRole(row)">
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
                <DropdownItem name="data">数据权限</DropdownItem>
                <DropdownItem name="user">分配用户</DropdownItem>
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
      <Modal
        v-model="showModal"
        :title="modalTitle"
        width="600"
        :loading="loading"
        :closable="false"
      >
        <Form
          :model="roleForm"
          :rules="ruleValidate"
          :label-width="100"
          :class="
            roleForm.dataScope === '2' || !isDataPermission ? 'roleForm' : ''
          "
          ref="roleForm"
        >
          <FormItem label="角色名称:" prop="roleName">
            <Input v-model="roleForm.roleName"></Input>
          </FormItem>
          <FormItem label="权限字符:" prop="roleKey">
            <Input v-model="roleForm.roleKey"></Input>
          </FormItem>
          <template v-if="!isDataPermission">
            <FormItem label="显示顺序:" prop="roleSort">
              <Input v-model="roleForm.roleSort"></Input>
            </FormItem>
            <FormItem label="状态:" prop="status">
              <i-switch v-model="roleForm.status"> </i-switch>
            </FormItem>
            <FormItem label="备注:" prop="remark">
              <Input v-model="roleForm.remark"></Input>
            </FormItem>
            <FormItem label="菜单权限:">
              <menu-tree
                @handleIdChange="getMenuIds"
                :init="initTree"
                type="menu"
                :ids="curMenuIds"
                :select="true"
              ></menu-tree>
            </FormItem>
          </template>
          <template v-else>
            <FormItem label="权限字符:" prop="dataScope">
              <Select clearable v-model="roleForm.dataScope" style="width: 200px">
                <Option
                  v-for="item in permissionList"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}</Option
                >
              </Select>
              <Alert class="mt-10" show-icon>特殊情况下，设置为“自定数据权限”</Alert>
            </FormItem>
            <FormItem label="数据权限:" v-if="roleForm.dataScope === '2'">
              <menu-tree
                @handleIdChange="getPermissionIds"
                :init="initTree"
                :select="true"
                type="depart"
              ></menu-tree>
            </FormItem>
          </template>
        </Form>
        <template slot="footer">
          <Button type="text" @click="handleModalConfirmCancel">取消</Button>
          <Button type="primary" @click="handleModalConfirm">确定</Button>
        </template>
      </Modal>
    </template>
    <template v-else>
      <distribute-role @returnRoleList="showDistributeRole=false"></distribute-role>
    </template>
  </div>
</template>

<script>
import {
  getList,
  addRole,
  deleteRole,
  updateRole,
  updateRoleDataScope,
} from "../../api/role";
import MenuTree from "../../components/MenuTree.vue";
import DistributeRole from './DistributeRole.vue';
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
        width: 200,
      },
    ];
    const ruleValidate = {
      roleName: [
        {
          required: true,
          message: "角色名称不能为空",
          trigger: "blur",
        },
      ],
      roleKey: [
        {
          required: true,
          message: "权限字符不能为空",
          trigger: "blur",
        },
      ],
      roleSort: [
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
        pageNum: 1,
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
          permission: 'system:role:add'
        },
        {
          type: "warning",
          icon: "md-download",
          label: "导出",
          key: "export",
          permission: 'system:role:export'
        },
        {
          type: "error",
          icon: "md-close",
          label: "删除",
          key: "delete",
          permission: 'system:role:remove'
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
        dataScope: 1,
      },
      ruleValidate,
      loading: true,
      menuIds: [],
      opType: "create",
      selectedData: [],
      initTree: false,
      isDataPermission: false,
      permissionList: [
        {
          value: "1",
          label: "全部数据权限",
        },
        {
          value: "2",
          label: "自定数据权限",
        },
        {
          value: "3",
          label: "本部门数据权限",
        },
        {
          value: "4",
          label: "本部门及以下数据权限",
        },
        {
          value: "5",
          label: "仅本人数据权限",
        },
      ],
      permissionIds: [],
      showDistributeRole: false,
      curMenuIds: [],
    };
  },
  components: {
    MenuTree,
    DistributeRole,
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
      try {
        const res = await getList(this.searchParams);
        this.roleList = res.rows.map((item) => {
          return {
            ...item,
            status: !parseInt(item.status, 10),
          };
        });
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addRole() {
      this.opType = "create";
      this.modalTitle = "新增角色";
      this.showModal = true;
      this.isDataPermission = false;
      this.$nextTick(() => {
        this.$refs["roleForm"].resetFields();
      });
      this.initTree = true;
    },
    exportRole() {
      console.log("export");
    },
    async deleteRole(data) {
      let ids = [];
      if (data) {
        ids = [data.roleId];
      } else {
        ids = this.selectedData.map((item) => item.roleId);
      }
      try {
        await deleteRole(ids);
        this.$Message.success("删除成功");
        this.getData();
        this.selectedData = [];
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    resetParams() {
      this.searchParams = {
        roleName: "",
        roleKey: "",
        status: "",
        timeRange: "",
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
    handleModalConfirm() {
      this.$refs["roleForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            menuIds: this.menuIds,
            ...this.roleForm,
            status: this.roleForm.status ? "0" : "1",
          };
          try {
            this.isDataPermission
              ? await updateRoleDataScope(params)
              : this.opType === "create"
              ? await addRole(params)
              : await updateRole(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.$refs["roleForm"].resetFields();
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    handleModalConfirmCancel() {
      this.showModal = false;
      this.initTree = false;
    },
    getMenuIds(ids) {
      this.menuIds = ids;
    },
    editRole(data) {
      this.curMenuIds =  data.menuIds;
      this.modalTitle = "编辑角色";
      this.opType = "edit";
      this.showModal = true;
      this.roleForm = {
        roleName: data.roleName,
        roleKey: data.roleKey,
        roleSort: data.roleSort,
        status: !parseInt(data.status, 10),
        remark: data.remark,
        dataScope: data.dataScope,
        roleId: data.roleId,
      };
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    getPermissionIds(ids) {
      this.permissionIds = ids;
    },
    handleDropClick(name, data) {
      if (name === "data") {
        this.isDataPermission = true;
        this.showModal = true;
        this.initTree = true;
        this.roleForm = {
          roleName: data.roleName,
          roleKey: data.roleKey,
          roleSort: data.roleSort,
          status: !parseInt(data.status, 10),
          remark: data.remark,
          dataScope: data.dataScope,
          deptIds: this.permissionIds,
        };
      } else {
        this.showDistributeRole = true;
      }
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
.role {
  /deep/ .ivu-table-wrapper {
    overflow: unset;
  }
}
</style>
