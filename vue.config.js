module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: './srv'
    }
  }
}
