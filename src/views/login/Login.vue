<template>
  <div class="login w-full h-full">
    <div class="login-form">
      <div class="title">系统账户登录</div>
      <Form
        :model="loginForm"
        label-position="top"
        :rules="ruleValidate"
        hide-required-mark
        ref="loginForm"
      >
        <FormItem label="用户名：" prop="username">
          <Input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></Input>
        </FormItem>
        <FormItem label="密码：" prop="password">
          <Input
            type="password"
            autocomplete="hi"
            v-model="loginForm.password"
            placeholder="请输入密码"
          ></Input>
        </FormItem>
        <Button type="primary" class="w-full mt-10" @click="handleSubmit('loginForm')">登 录</Button>
      </Form>
      <Checkbox class="mt-20" v-model="rememberAccount">记住账号名及密码</Checkbox
      >
    </div>
  </div>
</template>

<script>
import { Base64 } from 'js-base64';
import { getCookie, setCookie, setSession } from '../../utils/storage';
import { login, getPermission } from '../../api/login';
import setPermission from '../../permission';

export default {
  name: "login",
  data() {
    const ruleValidate = {
      username: [
        { required: true, message: "用户名不能为空", trigger: "blur" },
      ],
      password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
    };
    return {
      loginForm: {
        username: "",
        password: "",
      },
      rememberAccount: false,
      ruleValidate,
    };
  },
  mounted() {
    this.initForm();
  },
  methods: {
    initForm() {
      const cookie = getCookie();
      const { username, password } = cookie;
      if (username && password) {
        this.loginForm = {
          username,
          password: Base64.decode(password),
        };
        this.rememberAccount = true;
      }
    },
    handleSubmit(name) {
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const password = Base64.encode(this.loginForm.password);
          const storage = {
            ...this.loginForm,
            password,
          }
          try {
            const res = await login({
              username: this.loginForm.username,
              password: `QWERTYUIOPMNBVCX${password}` // 后端加密盐值
            });
            this.$Message.success("登录成功，正在进入首页");
            setSession('token', res.token);
            // 获取菜单
            const permissionRes = await getPermission();
            if (permissionRes.code === 200) {
              setSession('permission', permissionRes.data);
              setPermission();
            }
            this.rememberAccount && setCookie(storage, 5);
            setTimeout(() => {
              this.$router.push('/home');
            }, 200);
          } catch (e) {
            this.$Message.error(res.msg);
          }
        }
      });

    },
  },
};
</script>

<style lang="less" scoped>
.login {
  background: url("../../assets/img/background4.png");
  background-size: cover;
  overflow: hidden;
  .login-form {
    color: #fff;
    padding: 20px;
    width: 30%;
    height: 450px;
    background: rgba(40, 62, 108, 0.6);
    margin-left: 60%;
    margin-top: 10%;
    border-radius: 4px;
    /deep/ .ivu-form .ivu-form-item-label {
      color: #fff;
    }
    .title {
      text-align: center;
      font-weight: 500;
      font-size: 20px;
      margin-bottom: 30px;
    }
  }
  /deep/ .ivu-checkbox-default {
    font-size: 12px;
  }
}
</style>