<template>
  <div class="dept w-full">
    <div class="search-bar" v-permission="'system:dept:query'">
      <div class="mr-20">
        <span class="label">部门名称：</span>
        <Input
          v-model="searchParams.deptName"
          placeholder="请输入部门名称"
          style="width: 200px"
        />
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
      <Button 
        type="primary" 
        icon="md-add" 
        ghost 
        class="mr-10" 
        @click="addDept"
        v-permission="'system:dept:add'"
      >
        新增
      </Button>
    </div>
    <div class="table-data relative">
      <Spin fix v-if="loading"></Spin>
      <Table :columns="columns" :data="deptList" row-key="deptId">
        <template slot-scope="{ row }" slot="status">
          <Badge color="green" text="正常" v-if="row.status === '0'" />
          <Badge color="red" text="停用" v-if="row.status === '1'" />
        </template>
        <template slot-scope="{ row }" slot="action">
          <a class="mr-10" v-permission="'system:dept:edit'" @click="editDept(row)">编辑</a>
          <a class="mr-10" v-permission="'system:dept:add'" @click="addDept(row)">新增</a>
          <Poptip confirm v-permission="'system:dept:remove'" title="确认删除该部门吗" @on-ok="deleteDept(row)">
            <a class="error-link" v-if="row.parentId !== 0">删除</a>
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
        :model="deptForm"
        :rules="ruleValidate"
        :label-width="100"
        ref="deptForm"
      >
        <FormItem label="上级部门:" prop="parent">
          <Cascader 
            change-on-select 
            :data="allTreeData" 
            v-model="deptForm.parent">
          </Cascader>
        </FormItem>
        <FormItem label="部门名称:" prop="deptName">
          <Input v-model="deptForm.deptName"></Input>
        </FormItem>
        <FormItem label="排序:" prop="orderNum">
          <Input v-model="deptForm.orderNum"></Input>
        </FormItem>
        <FormItem label="负责人:" prop="leader">
          <Input v-model="deptForm.leader"></Input>
        </FormItem>
        <FormItem label="联系电话:" prop="phone">
          <Input v-model="deptForm.phone"></Input>
        </FormItem>
        <FormItem label="部门状态:" prop="status">
          <i-switch v-model="deptForm.status"> </i-switch>
        </FormItem>
        <FormItem label="邮箱:" prop="email">
          <Input v-model="deptForm.email"></Input>
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
import { getList, addDept, updateDept, deleteDept } from "@/api/dept";
export default {
  name: "department",
  data() {
    const columns = [
      {
        title: "部门名称",
        key: "deptName",
        tree: true,
      },
      {
        title: "排序",
        key: "orderNum",
      },
      {
        title: "状态",
        key: "status",
        slot: "status",
      },
      {
        title: "创建时间",
        key: "createTime",
      },
      {
        title: "操作",
        slot: "action",
        width: 150,
      },
    ];
    const validateParent = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error('上级部门不能为空'));
      } else {
        callback();
      }
    };
    const ruleValidate = {
      parent: [
        {
          validator: validateParent,
          trigger: "blur",
        },
      ],
      deptName: [
        {
          required: true,
          message: "部门名称不能为空",
          trigger: "blur",
        },
      ],
      orderNum: [
        {
          required: true,
          message: "排序不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      columns,
      deptList: [],
      total: 0,
      searchParams: {
        curPage: 1,
        pageSize: 10,
        deptName: "",
        status: "",
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
      loading: true,
      ruleValidate,
      deptForm: {
        deptName: '',
        status: true,
        phone: '',
        leader: '',
        orderNum: '',
        email: '',
        parent: [],
      },
      modalTitle: '新增部门',
      showModal: false,
      init: true,
      allTreeData: [],
      flatData: [],
      opType: 'create',
    };
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        const treeData = [];
        if (this.searchParams.deptName || this.searchParams.status === "1") {
          this.deptList = res.data;
          return;
        }
        // 将数据处理成为树结构
        const root = res.data.find((item) => item.parentId === 0);
        if (root) {
          root._showChildren = true;
          root.label = root.deptName;
          root.value = root.deptId;
          treeData.push(root);
          const firstLevelNodes = res.data.filter(
            (item) => item.parentId === root.deptId
          );
          treeData[0].children = firstLevelNodes.map((item) => {
            return {
              ...item,
              _showChildren: true,  // 默认展开
              label: item.deptName,
              value: item.deptId,
            };
          });
          res.data.forEach((dept, index) => {
            const firstLevelIds = firstLevelNodes.map((item) => item.deptId);
            if (!firstLevelIds.includes(dept.deptId)) {
              const findReuslt = this.findParent(treeData, dept);
              if (!findReuslt) {
                res.data.splice(index, 1);
                res.data.push(dept);
              }
            }
          });
          this.deptList = treeData;
          if (this.init) {
            // 保存全部的树结构
            this.allTreeData = treeData;
            this.flatData = res.data;
          }
        }
      } catch (e) {
        this.$Message.error(res.msg);
      }
      this.init = false;
      this.loading = false;
    },
    addDept(data) {
      this.modalTitle = '新增部门';
      this.opType = 'create';
      this.$refs.deptForm.resetFields();
      if (data) {
        this.getAllParent(data);
      }
      this.showModal = true;
    },
    async deleteDept(data) {
      try {
        await deleteDept(data.deptId);
        this.$Message.success('删除成功');
        this.init = true;
        this.getData();
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    resetParams() {
      this.searchParams = {
        curPage: 1,
        pageSize: 10,
        deptName: "",
        status: "",
      };
    },
    handlePageSizeChange(size) {
      this.pageParams.pageSize = size;
      this.getData();
    },
    handlePageChange(page) {
      this.pageParams.curPage = page;
      this.getData();
    },
    findParent(list, dept) {
      if (!dept.parentId) {
        return;
      }
      let result = false;
      const children = list[0].children;
      function recrusionChildren(children) {
        for (let item of children) {
          if (item.deptId === dept.parentId) {
            dept.label = dept.deptName;
            dept.value = dept.deptId;
            item.children.push(dept);
            result = true;
            break;
          }
          recrusionChildren(item.children);
        }
      }
      recrusionChildren(children);
      return result;
    },
    handleModalConfirmCancel() {
      this.showModal = false;
      this.initTree = false;
    },
    handleModalConfirm() {
      this.$refs["deptForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.deptForm,
            parentId: this.deptForm.parent[this.deptForm.parent.length - 1],
            status: this.deptForm.status ? '0' : '1',
          };
          delete params.parent;
          try {
            this.opType === "create" ? await addDept(params) : await updateDept(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
            this.init = true;
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    editDept(data) {
      this.showModal = true;
      this.opType = 'edit';
      this.modalTitle = '编辑部门';
      this.deptForm = {
        deptName: data.deptName,
        status: data.status === '0' ? true : false,
        phone: data.phone,
        leader: data.leader,
        orderNum: data.orderNum,
        email: data.email,
        parent: [],
        deptId: data.deptId,
      }
      this.getAllParent(data);
    },
    getAllParent(data) {
      let dept = data;
      const superiorDeptId = this.opType === 'create' ? [data.deptId] : [];
      while (dept.parentId) {
        superiorDeptId.push(dept.parentId);
        dept = this.flatData.find(item => item.deptId === dept.parentId);
      }
      this.deptForm.parent = superiorDeptId.reverse();
    }
  },
};
</script>

<style></style>
