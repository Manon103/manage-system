<template>
  <div class="report-fill w-full">
    <div class="search-bar">
      <div class="mr-20 mb-10">
        <span class="label">角色名称：</span>
        <Input v-model="searchParams.roleName" placeholder="请输入角色名称" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">权限字符：</span>
        <Input v-model="searchParams.roleKey" placeholder="请输入权限字符" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">角色状态：</span>
        <Select v-model="searchParams.status" style="width:200px">
          <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </div>
      <div class="mr-20">
        <span class="label">创建时间：</span>
        <DatePicker 
          type="daterange" 
          placement="bottom-end" 
          placeholder="选择时间" 
          style="width: 200px"
          v-model="searchParams.timeRange">
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
          @click="handleOperationClick(item.key)">
          {{item.label}}
        </Button>
      </template>
    </div>
    <div class='table-data'>
      <Table :columns="columns" :data="roleList">
        <template slot-scope="{ row, index }" slot="status">
          <i-switch v-model="row.status"/>
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
  </div>
</template>

<script>
import { getList } from '@/api/role';
export default {
  name: 'role',
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '角色编号',
        key: 'roleId'
      },
      {
        title: '角色名称',
        key: 'roleName'
      },
      {
        title: '权限字符',
        key: 'roleKey'
      },
      {
        title: '显示顺序',
        key: 'roleSort'
      },
      {
        title: '角色状态',
        slot: 'status',
      },
      {
        title: '创建时间',
        key: 'createTime',
        width: 180,
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ]
    return {
      searchParams: {
        roleName: '',
        roleKey: '',
        status: '',
        timeRange: '',
      },
      statusList: [
        {
          value: '',
          label: '全部'
        },
        {
          value: '0',
          label: '正常'
        },
        {
          value: '1',
          label: '停用'
        },
      ],
      operationBtns: [
        {
          type: 'primary',
          icon: 'md-add',
          label: '添加',
          key: 'add'
        },
        {
          type: 'warning',
          icon: 'md-download',
          label: '导出',
          key: 'export'
        },
        {
          type: 'error',
          icon: 'md-close',
          label: '删除',
          key: 'delete'
        },
      ],
      columns,
      roleList: [
        {
          date: '2022-01-07'
        }
      ],
      total: 0,
      pageParams: {
        curPage: 1,
        pageSize: 10,
      }
    }
  },
  created() {
    this.getData();
  },
  methods: {
    handleOperationClick(key) {
      const map = {
        add: 'addReport',
        export: 'exportReport',
        delete: 'deleteReport',
      }
      this[map[key]]();
    },
    async getData() {
      const res = await getList(this.searchParams);
      if (res.code === 200) {
        this.roleList = res.rows.map(item => {
          return {
            ...item,
            status: !parseInt(item.status, 10),
          }
        });
      }
    },
    addReport() {
      console.log('add');
    },
    exportReport() {
      console.log('export');
    },
    deleteReport() {
      console.log('delete');
    },
    resetParams() {
      this.selectedDate = '';
      this.reportPerson = '';
      this.projectName = '';
    },
    handlePageSizeChange(size) {
      this.pageParams.pageSize = size;
      this.getData();
    },
    handlePageChange(page) {
      this.pageParams.curPage = page;
      this.getData();
    }
  }
}
</script>

<style>

</style>