<template>
  <div class="menu w-full">
    <div class="search-bar" v-permission="'system:dept:query'">
      <div class="mr-20">
        <span class="label">菜单名称：</span>
        <Input v-model="searchParams.menuName" placeholder="请输入菜单名称" style="width: 200px" />
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
        v-permission="'system:menu:add'"
        @click="addMenu">
        新增
      </Button>
    </div>
    <div class='table-data relative'>
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
            <a class="mr-10" v-permission="'system:menu:edit'" @click="editPost(row)">编辑</a>
            <Poptip confirm v-permission="'system:menu:remove'" title="确认删除该岗位吗" @on-ok="deleteMenu(row)">
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
        :model="menuForm"
        :rules="ruleValidate"
        :label-width="100"
        ref="menuForm"
      >
        <FormItem label="上级菜单:" prop="parentId">
          <Cascader 
            change-on-select 
            :data="allTreeData" 
            v-model="menuForm.parentId">
          </Cascader>
        </FormItem>
        <FormItem label="菜单类型:" prop="menuType">
          <RadioGroup v-model="menuForm.menuType">
              <Radio label="M">
                <span>目录</span>
              </Radio>
              <Radio label="C">
                <span>菜单</span>
              </Radio>
              <Radio label="F">
                <span>按钮</span>
              </Radio>
            </RadioGroup>
        </FormItem>
        <FormItem v-if="menuForm.menuType !== 'F'" label="菜单图标:" prop="icon">
          <icon-select v-model="menuForm.icon"></icon-select>
        </FormItem>
        <div class="flex">
          <FormItem label="菜单名称:" prop="menuName" style="flex: 1">
            <Input v-model="menuForm.menuName"></Input>
          </FormItem>
          <FormItem label="显示排序:" prop="orderNum" style="flex: 1">
            <InputNumber :min="1" v-model="menuForm.orderNum" class="w-full"></InputNumber>
          </FormItem>
        </div>
        <div class="flex" v-if="menuForm.menuType !== 'F'">
          <FormItem label="是否外链:" prop="isFrame" style="flex: 1">
            <RadioGroup v-model="menuForm.isFrame">
              <Radio label="0">
                <span>是</span>
              </Radio>
              <Radio label="1">
                <span>否</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="路由地址:" prop="path" style="flex: 1">
            <Input v-model="menuForm.path"></Input>
          </FormItem>
        </div>
        <div class="flex">
          <FormItem v-if="menuForm.menuType === 'C'" label="组件路径:" prop="component" style="flex: 1">
            <Input :disabled="opType === 'edit'" v-model="menuForm.component"></Input>
          </FormItem>
          <FormItem v-if="menuForm.menuType !== 'M'"  label="权限字符:" prop="perms" style="flex: 1">
            <Input :disabled="opType === 'edit'" v-model="menuForm.perms"></Input>
          </FormItem>
        </div>
        <div class="flex" v-if="menuForm.menuType === 'C'">
          <FormItem label="路由参数:" prop="query" style="flex: 1">
            <Input v-model="menuForm.query"></Input>
          </FormItem>
          <FormItem label="是否缓存:" prop="isCache" style="flex: 1">
            <RadioGroup v-model="menuForm.isCache">
              <Radio label="0">
                <span>是</span>
              </Radio>
              <Radio label="1">
                <span>否</span>
              </Radio>
            </RadioGroup>
          </FormItem>
        </div>
        <div class="flex" v-if="menuForm.menuType !== 'F'">
          <FormItem label="菜单状态:" prop="status" style="flex: 1">
            <i-switch v-model="menuForm.status"> </i-switch>
          </FormItem>
          <FormItem label="显示状态:" prop="visible" style="flex: 1">
            <i-switch v-model="menuForm.visible"> </i-switch>
          </FormItem>
        </div>
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
import IconSelect from '../../components/IconSelect.vue';
import setPermission from '../../permission';
export default {
  name: 'systemMenu',
  components: {
    IconSelect,
  },
  data() {
    const columns = [
      {
        title: '菜单名称',
        key: 'menuName',
        tree: true,
        width: 200
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
        key: 'createTime',
        width: 180
      },
      {
        title: '操作',
        slot: 'action',
      }
    ];
    const ruleValidate = {
      menuName: [
        {
          required: true,
          message: "菜单名称不能为空",
          trigger: "blur",
        },
      ],
      orderNum: [
        {
          required: true,
          message: "显示排序不能为空",
          trigger: "blur",
          type: 'number'
        },
      ],
      path: [
        {
          required: true,
          message: "路由地址不能为空",
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
      menuForm: {
        parentId: [],
        menuType: 'M',
        icon: '',
        orderNum: 1,
        menuName: '',
        isFrame: '1',
        remark: '',
        path: '',
        status: true,
        visible: true,
        isCache: '0',
        perms: '',
        query: '',
        component: '',
      },
      ruleValidate,
      opType: 'create',
      allTreeData: [],
      init: true,
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
        const root = res.data.filter((item) => item.parentId === 0);
        if (root.length) {
          root.forEach(item => {
            item.label = item.menuName;
            item.value = item.menuId;
          })
          treeData = [...root];
          const firstLevelIds = root.map(item => item.menuId);
          res.data.forEach((menu, index) => {
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
            this.allTreeData = [
              {
                menuId: 0,
                label: '主类目',
                value: 0,
                children: treeData,
              }
            ];
            this.flatData = res.data;
          }
        }
      } catch (e) {
        this.$Message.error(res.msg);
      }
      this.init = false;
      this.loading = false;
    },
    addMenu() {
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '新增菜单';
      this.$refs.menuForm.resetFields();
      delete this.menuForm.menuId;
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
      this.$refs["menuForm"].validate(async (valid) => {
        if (valid) {
          const params = {
            ...this.menuForm,
            status: this.menuForm.status ? '0' : '1',
            visible: this.menuForm.visible ? '0' : '1',
            parentId: this.menuForm.parentId[this.menuForm.parentId.length - 1]
          };
          try {
            this.opType === "create" ? await add(params) : await update(params);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.init = true;
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
      this.menuForm = {
        ...data,
        status: data.status === '0' ? true: false,
        visible: data.visible === '0' ? true: false,
        orderNum: parseInt(data.orderNum, 10),
        parentId: data.parentId,
      };
      this.getAllParent(data);
      this.modalTitle = '编辑菜单';
    },
    async deleteMenu(data) {
      try {
        await deleteMenu(data.menuId);
        this.$Message.success('删除成功');
        this.init = true;
        this.getData();
      } catch (e) {
        this.$Message.error('删除失败');
      }
    },
    getAllParent(data) {
      let dept = data;
      const superiorDeptId = this.opType === 'create' ? [data.parentId] : [];
      while (dept && dept.parentId !== null) {
        superiorDeptId.push(dept.parentId);
        dept = this.flatData.find(item => item.menuId === dept.parentId);
      }
      this.menuForm.parentId = superiorDeptId.reverse();
    },
    findParent(list, menu) {
      if (!menu.parentId) {
        return;
      }
      let result = false;
      const children = list;
      function recrusionChildren(children) {
        if (children && children.length) {
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
      }
      recrusionChildren(children);
      return result;
    },
  }
}
</script>

<style scoped lang="less">
.menu {
  /deep/ .ivu-table-wrapper {
    overflow: initial;
  }
}
</style>