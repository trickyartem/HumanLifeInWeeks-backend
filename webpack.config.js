const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  watch: true,
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, '/bundle'),
    filename: 'index.js',
  },
  devServer: {
    inline: true,
    port: 8080,
  },
  resolve: {
    alias: {
      Src: path.resolve(__dirname, 'src')
    },
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx', '.json', '.scss', '.sass']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};
