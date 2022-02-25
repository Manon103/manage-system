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
          <template slot-scope="{ row }" slot="action">
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
  </div>
</template>

<script>
import MenuTree from "../../components/MenuTree.vue";
import { getList } from '@/api/user';
import { formatDate } from '@/utils/date';
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
      userList: [],
      selectedData: [],
      columns,
      loading: true,
      total: 0,
    };
  },
  created() {
    this.getData();
  },
  methods: {
    resetParams() {
      this.searchParams = {
        userName: "",
        phonenumber: "",
        status: "",
        pageSize: 10,
        pageNum: 1,
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
    addUser() {},
    exportUser() {},
    importUser() {},
    deleteUser() {},
    handleTableSelect(selections) {
      this.selectedData = selections;
    },
    editUser() {

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
      if (name === "data") {
      } else {
      }
    },
    selectTreeNode(id) {
      this.searchParams.deptId = id;
      this.getData();
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