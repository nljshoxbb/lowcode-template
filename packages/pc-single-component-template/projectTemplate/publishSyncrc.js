module.exports = {
  api: {
    syncInfo: {
      path: 'http://localhost:3200/v1/package/sync',
      method: 'POST'
    },
    upload: {
      path: "http://localhost:3200/v1/file/upload",
      method: "POST"
    }
  },
  zipSrc: "build",
  zipName: "docs",
}
