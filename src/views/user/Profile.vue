<template>
  <div class="profile">
    <div class="info mr-20">
      <Card>
        <p slot="title">个人信息</p>
        <img
          v-if="userInfo.avatar"
          :src="userInfo.avatar"
          alt=""
          class="header"
        />
        <Avatar v-else icon="ios-person" size="large" />
        <ul class="mt-20 mb-20">
          <li v-for="item in list" :key="item.value">
            <div>
              <svg class="icon" aria-hidden="true">
                <use :xlink:href="`#icon-${item.icon}`"></use>
              </svg>
              <span class="ml-10">{{ item.label }}</span>
            </div>
            <span>{{ item.value }}</span>
          </li>
        </ul>
      </Card>
    </div>
    <div class="modify">
      <Card>
        <p slot="title">基本资料</p>
        <Tabs v-model="curTab">
          <TabPane label="基本资料" name="basic">
            <Form
              ref="basicForm"
              :model="basicForm"
              :rules="basicValidate"
              :label-width="80"
            >
              <FormItem label="昵称" prop="nickName">
                <Input
                  v-model="basicForm.nickName"
                  style="width: 300px"
                ></Input>
              </FormItem>
              <FormItem label="手机号码" prop="phonenumber">
                <Input
                  v-model="basicForm.phonenumber"
                  style="width: 300px"
                ></Input>
              </FormItem>
              <FormItem label="邮箱" prop="email">
                <Input v-model="basicForm.email" style="width: 300px"></Input>
              </FormItem>
              <FormItem label="性别" prop="sex">
                <RadioGroup v-model="basicForm.sex">
                  <Radio label="0">
                    <span>男</span>
                  </Radio>
                  <Radio label="1">
                    <span>女</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
            </Form>
            <Button 
              type="primary" 
              style="margin-left: 80px" 
              class="mr-20"
              @click="updateBasicInfo">
              保存
            </Button>
          </TabPane>
          <TabPane label="修改密码" name="password">
            <Form
              ref="passForm"
              :model="passForm"
              :rules="passValidate"
              :label-width="80"
            >
              <FormItem label="旧密码" prop="oldPassword">
                <Input
                  v-model="passForm.oldPassword"
                  style="width: 300px"
                  type="password"
                  password
                ></Input>
              </FormItem>
              <FormItem label="新密码" prop="newPassword">
                <Input
                  v-model="passForm.newPassword"
                  style="width: 300px"
                  type="password"
                  password
                ></Input>
              </FormItem>
              <FormItem label="确认密码" prop="confirmPassword">
                <Input v-model="passForm.confirmPassword" style="width: 300px" type="password" password></Input>
              </FormItem>
            </Form>
            <Button 
              type="primary" 
              style="margin-left: 80px" 
              class="mr-20"
              @click="updatePassword">
              保存
            </Button>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<script>
import { clearSession } from '../../utils/storage';
import { getProfile, updateProfile, updatePassword } from "@/api/user";
export default {
  name: "profile",
  data() {
    const validatePassCheck = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('不能为空'));
      } else if (value !== this.passForm.newPassword) {
        callback(new Error('两次密码输入不一致'));
      } else {
        callback();
      }
    };
    const basicValidate = {
      nickName: [
        {
          required: true,
          message: "昵称不能为空",
          trigger: "blur",
        },
      ],
      phonenumber: [
        {
          required: true,
          message: "手机号不能为空",
          trigger: "blur",
        },
      ],
      email: [
        {
          required: true,
          message: "邮箱不能为空",
          trigger: "blur",
        },
      ],
    };
    const passValidate = {
      newPassword: [
        {
          required: true,
          message: "新密码不能为空",
          trigger: "blur",
        },
      ],
      oldPassword: [
        {
          required: true,
          message: "原密码不能为空",
          trigger: "blur",
        },
      ],
      confirmPassword: [
        { validator: validatePassCheck, trigger: 'blur' }
      ],
    }
    return {
      userInfo: {},
      list: [],
      curTab: "basic",
      basicForm: {
        nickName: "",
        phonenumber: "",
        email: "",
        sex: "",
      },
      passForm: {
        newPassword: "",
        oldPassword: "",
        confirmPassword: "",
      },
      basicValidate,
      passValidate,
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    async getUserInfo() {
      try {
        const res = await getProfile();
        this.userInfo = res.data;
        const roles = res.data.roles.map((item) => item.roleName);
        this.list = [
          {
            label: "用户名称",
            value: this.userInfo.userName,
            icon: "user",
          },
          {
            label: "手机号码",
            value: this.userInfo.phonenumber,
            icon: "phone",
          },
          {
            label: "用户邮箱",
            icon: "email-fill",
            value: this.userInfo.email,
          },
          {
            label: "所属部门",
            icon: "tree",
            value: this.userInfo.dept.deptName,
          },
          {
            label: "所属角色",
            icon: "peoples",
            value: roles.join("/"),
          },
          {
            label: "创建日期",
            icon: "date",
            value: this.userInfo.createTime,
          },
        ];
        this.basicForm = {...this.userInfo};
        this.curTab = 'basic';
      } catch (e) {
        this.$Message.error(e);
      }
    },
    updateBasicInfo() {
      this.$refs["basicForm"].validate(async (valid) => {
        if (valid) {
          try {
            await updateProfile(this.basicForm);
            this.$Message.success("操作成功");
            this.getUserInfo();
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    },
    updatePassword() {
      this.$refs["passForm"].validate(async (valid) => {
        if (valid) {
          try {
            await updatePassword(this.passForm);
            this.$Message.success("操作成功");
            this.$Message.warning('修改密码后请重新登录');
            clearSession();
            setTimeout(() => {
              this.$router.push('/login');
            }, 300);
          } catch (e) {
            this.$Message.error(e.msg);
          }
        }
      });
    }
  },
};
</script>

<style scoped lang="less">
.profile {
  display: flex;
  .info {
    width: 30%;
    /deep/ .ivu-card-body {
      text-align: center;
    }
    .header {
      height: 40px;
      width: 40px;
      border-radius: 50%;
    }
    ul {
      list-style: none;
      li {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #dcdcdc;
        &:nth-child(1) {
          border-top: 1px solid #dcdcdc;
        }
      }
    }
  }
  .modify {
    width: 70%;
  }
}
</style>
