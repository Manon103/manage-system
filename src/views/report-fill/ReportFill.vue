<template>
  <div class="report-fill w-full">
    <div class="search-bar">
      <div class="mr-20">
        <span class="label">填写日期：</span>
        <DatePicker type="date" placeholder="请选择填写日期" style="width: 200px" v-model="selectedDate"></DatePicker>
      </div>
      <div class="mr-20">
        <span class="label">填写人：</span>
        <Input v-model="reportPerson" placeholder="请输入填写人" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">项目名称：</span>
        <Input v-model="projectName" placeholder="请输入项目名称" style="width: 200px" />
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
      <Table :columns="columns" :data="reportList">
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
export default {
  name: 'reportFill',
  data() {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '填写日期',
        key: 'date'
      },
      {
        title: '项目名称',
        key: 'name'
      },
      {
        title: '周报内容',
        key: 'content'
      },
      {
        title: '填写人',
        key: 'author'
      },
      {
        title: '第几周/年',
        key: 'week'
      },
      {
        title: '操作',
        slot: 'action',
        width: 150,
      }
    ]
    return {
      selectedDate: '',
      reportPerson: '',
      projectName: '',
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
      reportList: [
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
  methods: {
    handleOperationClick(key) {
      const map = {
        add: 'addReport',
        export: 'exportReport',
        delete: 'deleteReport',
      }
      this[map[key]]();
    },
    getData() {

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