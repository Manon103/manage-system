<template>
  <div class="home">
    <div class="title mb-20">欢迎使用后台/周报系统</div>
    <Card class="mb-20">
      <div class="mb-20">
        <span style="font-weight: bold" class="mr-10">实时数据</span>
        <span>更新于{{curTime}}</span>
      </div>
      <div class="content">
        <div class="flex item" v-for="item in realtimeData" :key="item.title">
          <span>
            <Badge :color="item.badgeColor" :text="item.title"/>
          </span>
          <span class="count">{{item.number}}</span>
        </div>
      </div>
    </Card>
    <Card>
      <div class="mb-20">
        <span style="font-weight: bold" class="mr-10">快捷方式</span>
      </div>
      <div class="flex">
        <div class="mr-10 jump-item" v-for="item in jumpList" :key="item.title" @click="jumpToTarget(item.jumpTo)">
          <Alert 
            :type="item.alertType">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="`#icon-${item.icon}`"></use>
            </svg>
            {{item.title}}
          </Alert>
        </div>
        
      </div>
    </Card>
  </div>
</template>

<script>
import { getList as getOnlineList } from '@/api/online';
import { getList as getProjectList } from '@/api/project';
import { getList } from '@/api/diary';
import { formatTime } from '@/utils/date';
import { getSession } from '@/utils/storage';
export default {
  name: 'home',
  data() {
    return {
      searchParams: {
        pageNum: 1,
        pageSize: 999,
      },
      realtimeData: [
        {
          number: 0,
          title: '在线用户',
          badgeColor: 'green'
        },
        {
          number: 0,
          title: '项目总数',
          badgeColor: 'pink'
        },
        {
          number: 0,
          title: '周报总数',
          badgeColor: 'blue'
        },
      ],
      curTime: '',
      jumpList: [
        {
          title: '周报填写',
          alertType: 'info',
          icon: 'input',
          jumpTo: '',
        },
        {
          title: '用户管理',
          alertType: 'success',
          icon: 'user',
          jumpTo: '',
        },
        {
          title: '角色管理',
          alertType: 'warning',
          icon: 'peoples',
          jumpTo: '',
        },
      ]
    }
  },
  created() {
    this.curTime = formatTime(new Date());
    this.getData();
    this.getRoutes();
  },
  methods: {
    getData() {
      this.getOnlineNumber();
      this.getProjectNumber();
      this.getDiaryList();
    },
    getRoutes() {
      const routers = this.$router.getRoutes();
      // 菜单可变但组件不可变
      const diary = routers.find(item => item.meta.component === 'report/Diary');
      this.jumpList[0].jumpTo = diary ? diary.name : 'home';
      const user = routers.find(item => item.meta.component === 'user/User');
      this.jumpList[1].jumpTo = user ? user.name : 'home';
      const role = routers.find(item => item.meta.component === 'role/Role');
      this.jumpList[2].jumpTo = role ? role.name : 'home';
    },
    async getOnlineNumber() {
      try {
        const res = await getOnlineList(this.searchParams);
        this.realtimeData[0].number = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async getProjectNumber() {
      try {
        const res = await getProjectList(this.searchParams);
        this.realtimeData[1].number = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    async getDiaryList() {
      try {
        const { user } = getSession('userInfo');
        this.searchParams.createBy = user.userName;
        const res = await getList(this.searchParams);
        this.realtimeData[2].number = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    jumpToTarget(name) {
      this.$router.push({name});
    }
  }
}
</script>

<style lang='less' scoped>
.home {
  .title {
    font-size: 24px;
    font-weight: bold;
  }
  .content {
    display: flex;
    .item {
      width: 30%;
      flex-direction: column;
      align-items: center;
      height: 70px;
      justify-content: space-between;
      .count {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
  .jump-item {
    width: 30%;
    text-align: center;
    cursor: pointer;
    /deep/ .ivu-alert {
      padding: 0;
      height: 70px;
      line-height: 70px;
    }
  }
}
</style>