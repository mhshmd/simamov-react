const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].fonts.css');
const path = require('path');

var config = {
    entry: __dirname+'/src/js/Surtug/index.js',

    output: {
        path: __dirname+'/js/view',
        filename: 'surtug.js',
    },
    resolve: {
      alias: {
          "ag-grid": path.resolve('./node_modules/ag-grid')
      }
    },
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: ['react', 'env']
              }
            }
          },
          {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
          }]
      },
    plugins: [
        // new webpack.DefinePlugin({
        //     'PRODUCTION': JSON.stringify('apajiiii')
        // }),
        new webpack.optimize.UglifyJsPlugin({sourceMap: true}),
    ]
}

module.exports = config;