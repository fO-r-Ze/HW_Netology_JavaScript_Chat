const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      publicPath: isProd ? "./" : "/",
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      port: 8080,
      open: ["http://127.0.0.1:8080/"],
      host: "127.0.0.1",
      hot: true,
      liveReload: false,
      historyApiFallback: true,
      client: false,
    },
    devtool: isProd ? "source-map" : "eval-source-map",
  };
};