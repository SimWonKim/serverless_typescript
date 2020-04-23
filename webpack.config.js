const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  entry: path.join(__dirname, "src/server.ts"),
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  node: false,
  optimization: {
    minimize: false,
  },
  output: {
    libraryTarget: "commonjs",
    filename: "src/server.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
