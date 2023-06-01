const { library } = require('./build.json');

module.exports = {
  alias: {
    '@': './src',
  },
  plugins: [
    [
      '@alifd/build-plugin-lowcode',
      {
        library,
        engineScope: "<%= arguments[0].engineScope || '@ali' %>"
      },
    ],
    [
      '@alilc/build-plugin-alt',
      {
        type: 'component',
        inject: true,
        library,
        // 配置要打开的页面，在注入调试模式下，不配置此项的话不会打开浏览器
        // 可以填写 CMS-Lowcode 本地启动地址https://oams.newone.com.cn/editor或者线上https://oams.newone.com.cn/editor/?debug
        openUrl: 'https://oams.newone.com.cn/editor/?debug',
      }
    ]
  ],
};
