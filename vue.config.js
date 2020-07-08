const WebappWebpackPlugin = require("webapp-webpack-plugin");

module.exports = {
  lintOnSave: false,

  publicPath: process.env.VUE_APP_BASE_URL,

  pwa: {
    themeColor: "#148898"
  },

  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/scss/_variables.scss";`
      }
    }
  },

  configureWebpack: {
    // Merged into the final Webpack config
    plugins: [
      new WebappWebpackPlugin({
        // Your source logo (required)
        logo: "./src/assets/logo/VITU_Icon_300ppi.png",
        // Path to store cached data or false/null to disable caching altogether
        // Note: disabling caching may increase build times considerably
        cache: ".wwp-cache",
        // Prefix path for generated assets
        prefix: "favicons/",
        // Inject html links/metadata (requires html-webpack-plugin)
        inject: true,

        favicons: {
          appName: "VITU",
          start_url: "../",
          theme_color: "#148898",
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: false,
          twitter: true,
          yandex: false,
          windows: true
        }
      })
    ]
  }
};
