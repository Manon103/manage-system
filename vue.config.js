
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
}
