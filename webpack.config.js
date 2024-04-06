const path = require("path");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./frontend/entry.jsx",
  output: {
    path: __dirname + "/app/assets/javascripts/me",
    filename: "bundle.js",
    devtoolModuleFilenameTemplate: "[resourcePath]",
    devtoolFallbackModuleFilenameTemplate: "[resourcePath]?[hash]",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [{ loader: "babel-loader" }],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader" }],
        exclude: /node_modules/,
      },
    ],
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".tsx"],
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
      "react-redux": path.resolve("./node_modules/react-redux"),
    },
  },
};
