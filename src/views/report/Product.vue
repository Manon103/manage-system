<template>
  <div class="product w-full">
    <div class="search-bar" v-permission="'system:product:query'">
      <div class="mr-20">
        <span class="label">业务域名称：</span>
        <Input v-model="searchParams.productName" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">业务域编码：</span>
        <Input v-model="searchParams.productCode" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">负责人：</span>
        <Input v-model="searchParams.productManager" style="width: 200px" />
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
        :data="productList" >
        <template slot-scope="{ row }" slot="action">
            <a class="mr-10" v-permission="'system:product:edit'" @click="editProduct(row)">编辑</a>
            <Poptip confirm v-permission="'system:product:remove'" title="确认删除该业务域吗" @on-ok="deleteProduct(row)">
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
        :model="productFrom"
        :rules="ruleValidate"
        :label-width="120"
        ref="productFrom"
      >
        <FormItem label="业务域名称:" prop="productName">
          <Input v-model="productFrom.productName"></Input>
        </FormItem>
        <FormItem label="业务域编码:" prop="productCode">
          <Input v-model="productFrom.productCode"></Input>
        </FormItem>
        <FormItem label="业务域负责人:" prop="productManager">
          <Input v-model="productFrom.productManager"></Input>
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
import { getList, addProduct, updateProduct, deleteProduct } from '@/api/product';
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
        title: '业务域名称',
        key: 'productName'
      },
      {
        title: '业务域编码',
        key: 'productCode'
      },
      {
        title: '负责人',
        key: 'productManager'
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ];
    const ruleValidate = {
      productName: [
        {
          required: true,
          message: "名称不能为空",
          trigger: "blur",
        },
      ],
      productCode: [
        {
          required: true,
          message: "编码不能为空",
          trigger: "blur",
        },
      ],
      productManager: [
        {
          required: true,
          message: "负责人不能为空",
          trigger: "blur",
        },
      ],
    };
    return {
      searchParams: {
        productCode: '',
        productName: '',
        productManager: '',
        pageSize: 10,
        pageNum: 1,
      },
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add',
          permission: 'system:product:add'
        },
        // {
        //   type: 'warning',
        //   icon: 'md-download',
        //   label: '导出',
        //   key: 'export',
        //   permission: 'system:product:export'
        // },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete',
          permission: 'system:product:remove'
        },
      ],
      columns,
      productList: [],
      total: 0,
      showModal: false,
      modalTitle: '新增岗位',
      loading: false,
      productFrom: {
        productName: '',
        productCode: '',
        productManager: '',
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
        add: 'addProduct',
        export: 'exportProduct',
        delete: 'deleteProduct',
      }
      this[map[key]]();
    },
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.productList = res.rows;
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    addProduct() {
      this.showModal = true;
      this.opType = 'create';
      this.modalTitle = '新增业务域';
      this.$refs.productFrom.resetFields();
      delete this.productFrom.id;
    },
    exportProduct() {
      console.log('export');
    },
    resetParams() {
      this.searchParams = {
        productCode: '',
        productName: '',
        productManager: '',
        pageSize: this.searchParams.pageSize,
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
      this.$refs["productFrom"].validate(async (valid) => {
        if (valid) {
          try {
            this.opType === "create" ? await addProduct(this.productFrom) : await updateProduct(this.productFrom);
            this.$Message.success("操作成功");
            this.showModal = false;
            this.getData();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    editProduct(data) {
      this.opType = 'edit';
      this.showModal = true;
      this.productFrom = {...data};
      this.modalTitle = '编辑业务域';
    },
    async deleteProduct(data) {
      let ids = this.selectedData.map(item => item.id);
      if (data) {
        ids = [data.id];
      }
      try {
        await deleteProduct(ids);
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
  }
}
</script>

<style>

</style>