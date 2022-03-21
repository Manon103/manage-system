<template>
  <div class="home">
    <div class="title mb-20">欢迎使用后台/周报系统</div>
    <Card class="mb-20">
      <div class="mb-20">
        <span style="font-weight: bold" class="mr-10">实时数据</span>
        <span>更新于{{curTime}}</span>
      </div>
      <div class="content">
        <template v-for="item in realtimeData">
          <div class="flex item" v-if="!item.hidden" :key="item.title">
            <span>
              <Badge :color="item.badgeColor" :text="item.title"/>
            </span>
            <span class="count">{{item.number}}</span>
          </div>
        </template>
      </div>
    </Card>
    <Card>
      <div class="mb-20">
        <span style="font-weight: bold" class="mr-10">快捷方式</span>
      </div>
      <div class="flex">
        <div class="mr-10 jump-item" v-for="item in jumpList" :key="item.jumpTo" @click="jumpToTarget(item.jumpTo)">
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
import { getList as getProductList } from '@/api/product';
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
          badgeColor: 'green',
          hidden: false,
        },
        {
          number: 0,
          title: '项目总数',
          badgeColor: 'pink',
          hidden: false,
        },
        {
          number: 0,
          title: '周报总数',
          badgeColor: 'blue',
          hidden: false,
        },
        {
          number: 0,
          title: '业务域总数',
          badgeColor: 'green',
          hidden: true,
        },
      ],
      curTime: '',
      jumpList: [
        {
          title: '个人中心',
          alertType: 'error',
          icon: 'home',
          jumpTo: 'profile',
        },
      ],
      userName: ''
    }
  },
  created() {
    const { user } = getSession('userInfo');
    this.userName = user.userName;
    this.curTime = formatTime(new Date());
    this.getData();
    this.getRoutes();
  },
  methods: {
    getData() {
      if (this.userName === 'admin') {
        this.getOnlineNumber();
        this.realtimeData[3].hidden = true;
        this.realtimeData[0].hidden = false;
      } else {
        this.getProductNumber();
        this.realtimeData[0].hidden = true;
        this.realtimeData[3].hidden = false;
      }
      this.getProjectNumber();
      this.getDiaryList();
    },
    getRoutes() {
      const routers = this.$router.getRoutes().filter(item => item.meta.component);
      const alertType = ['success', 'info', 'warning'];
      for(let i = 0; i < 3; i++) {
        this.jumpList.push({
          title: routers[i].meta.title,
          alertType: alertType[i],
          icon: routers[i].meta.icon,
          jumpTo: routers[i].name,
        })
      }
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
        this.searchParams.createBy = this.userName;
        const res = await getList(this.searchParams);
        this.realtimeData[2].number = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
    },
    jumpToTarget(name) {
      this.$router.push({name});
    },
    async getProductNumber() {
      try {
        const res = await getProductList(this.searchParams);
        this.realtimeData[3].number = res.total;
      } catch (e) {
        this.$Message.error(e.msg);
      }
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