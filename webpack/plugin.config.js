const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    module: {
        rules: [
          {
            test: /\.(js|ts)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "ts-loader",
                options: {
                  transpileOnly: true,
                  silent: true,
                },
              },
            ],
          },
        ]
      },
      resolve: {
        extensions: ['.ts', '.js', '.json']
      },
      mode: "production",
      devtool: false,
      entry: './src/index.ts',
      output: {
        filename: 'index.min.js',
        path: path.resolve('./dist'),
        library: "ChartjsPluginScrollBar",
        libraryTarget: 'umd',
        clean: true
      },
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({ extractComments: false }),
        ],
      },
}