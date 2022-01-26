
// 项目部署基础
const webpack = require('webpack')

module.exports = {
    assetsDir: 'static',
    productionSourceMap: true,
    css: {
      loaderOptions: {
          less: {
              additionalData: `@import "@/assets/css/variable.less";`
          }
      }
    },
    devServer: {
        host: 'localhost',
        port: 8085, // 端口号
        // https: false, // https:{type:Boolean}
        open: true, // 配置自动启动浏览器
        disableHostCheck: true,// 配置反向代理
        hotOnly: true, // 热更新
        // proxy: {
        //     '/api': {
        //         target: 'http://139.198.190.129:8889/',  // 转发设置本地支持跨域
        //         changeOrigin: true,
        //         ws: true, // websocket支持
        //         secure: false,
        //     }
        // },
    }
}
