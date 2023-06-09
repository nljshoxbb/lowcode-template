module.exports = {
  api: {
    origin: 'http://localhost:3200',
    syncInfo: {
      path: '/v1/package/sync',
      method: 'POST',
    },
    upload: {
      path: '/v1/file/upload',
      method: 'POST',
    },
  },
  zipSrc: 'build',
  zipName: 'docs',
  /** 管理员分配token */
  token: '',
};