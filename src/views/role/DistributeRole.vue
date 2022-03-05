<template>
  <div class="distribute-role w-full">
    <div class="search-bar">
      <div class="mr-20 mb-10">
        <span class="label">登录名称：</span>
        <Input
          v-model="searchParams.roleName"
          placeholder="请输入登录名称"
          style="width: 200px"
        />
      </div>
      <div class="mr-20">
        <span class="label">手机号码：</span>
        <Input
          v-model="searchParams.phone"
          placeholder="请输入手机号码"
          style="width: 200px"
        />
      </div>
      <Button type="primary" class="mr-20" @click="getData">搜索</Button>
      <Button @click="resetParams">重置</Button>
    </div>
    <div class="mb-20">
      <template v-for="item in operationBtns">
        <Button
          :type="item.type"
          :icon="item.icon"
          :ghost="!!item.type"
          class="mr-10"
          :key="item.key"
          @click="handleOperationClick(item.key)"
          :disabled="item.disabled"
        >
          {{ item.label }}
        </Button>
      </template>
    </div>
    <div class="table-data relative">
      <Spin fix v-if="loading"></Spin>
      <Table :columns="columns" :data="roleList" @on-selection-change="handleTableSelect">
        <template slot-scope="{ row, index }" slot="status">
          <Badge color="red" text="错误" v-if="row.status !== '0'"/>
          <Badge color="green" text="正常" v-else />
        </template>
        <template slot-scope="{ row, index }" slot="action" v-if="row.roleId !== 1">
          <Poptip
            confirm
            title="确认取消授权吗"
            @on-ok="cancelAuth(row)">
            <a class="error-link">取消授权</a>
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
      title="选择用户"
      width="780"
      :loading="loading"
      :closable="false"
    >
      <div class="overflow-hidden">
        <Table :columns="columns.slice(0, columns.length - 1)" :data="unauthList" @on-selection-change="handleUnauthTableSelect">
          <template slot-scope="{ row, index }" slot="status">
            <Badge color="red" text="错误" v-if="row.status !== '0'"/>
            <Badge color="green" text="正常" v-else />
          </template>
        </Table>
        <Page
          class="right mt-10"
          :total="unauthTotal"
          @on-change="handleUnauthPageChange"
          show-sizer
          @on-page-size-change="handleUnauthPageSizeChange"
        />
      </div>
      <template slot="footer">
        <Button type="text" @click="handleModalConfirmCancel">取消</Button>
        <Button type="primary" @click="handleModalConfirm">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { getAuthList, getUnAuthList } from "../../api/role";
export default {
  name: "distributeRole",
  data() {
    const columns = [
      {
        type: "selection",
        width: 60,
        align: "center",
      },
      {
        title: "登录名称",
        key: "roleId",
      },
      {
        title: "用户名称",
        key: "roleName",
      },
      {
        title: "邮箱",
        key: "roleKey",
      },
      {
        title: "手机",
        key: "roleSort",
      },
      {
        title: "用户状态",
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
    return {
      searchParams: {
        // roleName: "",
        // roleKey: "",
        // status: "",
        // timeRange: "",
        pageNum: 1,
        pageSize: 10,
      },
      operationBtns: [
        {
          type: "primary",
          icon: "md-add",
          label: "添加用户",
          key: "add",
        },
        {
          type: "warning",
          icon: "md-download",
          label: "批量取消授权",
          key: "cancel",
        },
        {
          icon: "ios-undo",
          label: "返回",
          key: "return",
        },
      ],
      columns,
      roleList: [],
      total: 0,
      loading: false,
      showModal: false,
      loading: true,
      selectedData: [],
      unauthTotal: 0,
      unauthParams: {
        pageSize: 10,
        pageNum: 1,
      },
      unauthList: [],
      unauthSelected: [],
    };
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
        add: "addAuth",
        cancel: "cancelAuth",
        return: "returnRole",
      };
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      if (this.searchParams.status === "all") {
        this.searchParams.status = "";
      }
      try {
        const res = await getAuthList(this.searchParams);
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
    addAuth() {
      this.showModal = true;
      this.getUnauthList();
    },
    async cancelAuth(data) {
      let ids = [];
      // if (data) {
      //   ids = [data.roleId];
      // } else {
      //   ids = this.selectedData.map(item => item.roleId);
      // }
      // const res = await deleteRole(ids);
      // if (res.code === 200) {
      //   this.$Message.success('删除成功');
      //   this.getData();
      // } else {
      //   this.$Message.error(res.msg);
      // }
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
    async handleModalConfirm() {
      const params = {
        menuIds: this.menuIds,
        ...this.roleForm,
        status: this.roleForm.status ? '0' : '1',
      };
      try {
        const res = this.isDataPermission 
                    ? await updateRoleDataScope(params)
                    : this.opType === 'create' ? await addRole(params) : await updateRole(params);
        this.$Message.success('操作成功');
        this.showModal = false;
        this.$refs['roleForm'].resetFields();
        this.getData();
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    handleModalConfirmCancel() {
      this.showModal = false;
    },
    returnRole() {
      this.$emit('returnRoleList');
    },
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    handleUnauthPageChange(page) {
      this.unauthParams.pageNum = page;
    },
    handleUnauthPageSizeChange(size) {
      this.unauthParams.pageSize = page;
    },
    handleUnauthTableSelect(data) {
      this.unauthSelected = data;
    },
    async getUnauthList() {
      try {
        const res = await getUnAuthList(this.unauthParams);
        this.unauthList = res.rows.map((item) => {
          return {
            ...item,
            status: !parseInt(item.status, 10),
          };
        });
        this.unauthTotal = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    }
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