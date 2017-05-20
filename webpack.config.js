const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const phaserModule = path.join(__dirname, '/node_modules/phaser/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve('./dist'),
        publicPath: '/'
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: './src/assets/dist',
            to: './assets'
        }]),
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body',
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({_: 'underscore'})
    ],
    module: {
        loaders: [
            {test: /pixi\.js/, loader: 'expose-loader?PIXI'},
            {test: /phaser-split\.js$/, loader: 'expose-loader?Phaser'},
            {test: /p2\.js/, loader: 'expose-loader?p2'},
            {test: /\.ts?$/, loader: 'ts-loader', exclude: '/node_modules/'}
        ]
    },
    node: {
        fs: 'empty'
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'p2': p2,
        }
    },
    // devtool: 'source-map'
};