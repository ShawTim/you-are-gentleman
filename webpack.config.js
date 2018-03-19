const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './js/app.js',
  output: {
    path: __dirname + '/docs',
    filename: 'bundle.min.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: '*.html' },
      { from: '*.png' },
      { from: '*.jpg' },
      { from: './images/*.jpg' },
      { from: './images/*.png' },
    ])
  ],
  module: {
    loaders: [{
      test: /\.(s)*css$/,
      loaders: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.(ttf|jpg|png)$/,
      loaders: [
        'url-loader'
      ]
    }, {
      test: /\.js$/,
      loaders: [
        'babel-loader?presets[]=es2015'
      ]
    }]
  }
}
