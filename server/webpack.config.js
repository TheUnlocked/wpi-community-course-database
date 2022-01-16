const path = require('path');
const webpack = require('webpack');

/** @type {webpack.Configuration} */
module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, './index.ts'),
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node-modules/
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, '../serverdist'),
        filename: 'index.bundle.js',
    },
};