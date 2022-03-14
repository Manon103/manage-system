<template>
  <div class="online-user w-full">
    <div class="search-bar" v-permission="'monitor:online:query'">
      <div class="mr-20">
        <span class="label">登录地址：</span>
        <Input v-model="searchParams.ipaddr" placeholder="请输入登录地址" style="width: 200px" />
      </div>
      <div class="mr-20">
        <span class="label">用户名称：</span>
        <Input v-model="searchParams.userName" placeholder="请输入用户名称" style="width: 200px" />
      </div>
      <Button type="primary" class="mr-20" @click="getData">搜索</Button>
      <Button @click="resetParams">重置</Button>
    </div>
    <div class='table-data relative'>
      <Spin fix v-if="loading"></Spin>
      <Table 
        :columns="columns" 
        :data="onlineList">
        <template slot-scope="{ row }" slot="action">
          <Poptip
            confirm
            title="确认清退该用户吗"
            v-permission="'monitor:online:forceLogout'"
            @on-ok="forceLogout(row)">
            <a class="error-link">强退</a>
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
  </div>
</template>

<script>
import { quitUser, getList } from '@/api/online';
import {formatTime} from '@/utils/date.js';
export default {
  name: 'online',
  data() {
    const columns = [
      {
        title: '序号',
        key: 'index',
        width: 70,
      },
      {
        title: '会话编号',
        key: 'tokenId',
        width: 150
      },
      {
        title: '登录名称',
        key: 'userName'
      },
      {
        title: '部门名称',
        key: 'deptName'
      },
      {
        title: '主机',
        key: 'ipaddr'
      },
      {
        title: '登录地点',
        key: 'loginLocation'
      },
      {
        title: '浏览器',
        key: 'browser'
      },
      {
        title: '操作系统',
        key: 'os'
      },
      {
        title: '登录时间',
        key: 'time',
        width: 170
      },
      {
        title: '操作',
        slot: 'action',
        width: 80,
      }
    ];
    return {
      searchParams: {
        ipaddr: '',
        userName: '',
        pageSize: 10,
        pageNum: 1,
      },
      onlineList: [],
      columns,
      loading: false,
      total: 0,
    }
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        const res = await getList(this.searchParams);
        this.onlineList = res.rows.map((item, i) => {
          return {
            index: i + 1,
            ...item,
            time: formatTime(item.loginTime),
          }
        });
        this.total = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
      this.loading = false;
    },
    resetParams() {
      this.searchParams = {
        ipaddr: '',
        userName: '',
        pageSize: this.searchParams.pageSize,
        pageNum: 1,
      };
      this.getData();
    },
    async forceLogout(data) {
      try {
        await quitUser(data.tokenId);
        this.$Message.success('操作成功');
        this.getData();
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    handlePageSizeChange(size) {
      this.searchParams.pageSize = size;
      this.getData();
    },
    handlePageChange(page) {
      this.searchParams.pageNum = page;
      this.getData();
    },
  }
}
</script>

<style lang='less' scoped>
.online-user {
  /deep/ .ivu-table-cell {
    text-overflow: ellipsis;
    white-space: nowrap !important;
    overflow: hidden;
  }
}
</style>