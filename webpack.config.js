const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackConcatPlugin = require("webpack-concat-files-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const terser = require("terser");

const jsArr = [
  path.resolve(__dirname, "src/js/jquery-3.6.0.min.js"),
  path.resolve(__dirname, "src/js/script.js"),
];

const files = fs.readdirSync(path.join(__dirname, "src"));

const templatesFiles =
  files.filter((el) => /\.html$/.test(el) && el !== "index.html") || [];

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const plugins = [
    new MiniCssExtractPlugin({ filename: "./dist/css/style.css" }),
    new WebpackConcatPlugin({
      allowOptimization: true,
      bundles: [
        {
          src: jsArr,
          dest: "./dist/js/script.js",
          transforms: jsArr
            ? {
                after: async (code) => {
                  const result = await terser.minify(code);
                  return result.code;
                },
              }
            : {},
        },
      ],
    }),

  ];

  if (!isProduction) {
    plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/index.html"),
      }),
      new webpack.HotModuleReplacementPlugin()
    );

    templatesFiles.length &&
      templatesFiles.map((item) => {
        plugins.push(
          new HtmlWebpackPlugin({
            filename: `${item}`,
            template: path.resolve(__dirname, `src/${item}`),
          })
        );
      });
  }
  if (isProduction) {
    plugins.push(
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: "**/*",
            context: path.resolve(__dirname, "src"),
            globOptions: {
              ignore: ["**/*.{js,scss}"],
            },
          },
        ],
      })
    );
  }

  return {
    mode: argv.mode,
    entry: {
      app: ["./src/js/app.js", "./src/scss/style.scss"],
    },
    output: {
      path: __dirname + "/dist",
      filename: "js/[name].js",
    },
    devtool: isProduction ? "source-map" : "source-map",

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  outputStyle: isProduction ? "compressed" : "expanded",
                },
              },
            },
          ],
        },
      ],
    },

    plugins,

    devServer: {
      contentBase: path.join(__dirname, "src"),
      compress: true,
      port: 9000,
      overlay: true,
      open: true,
      stats: {
        all: false,
        assets: true,
        assetsSort: "!size",
        errors: true,
      },
    },
  };
};
