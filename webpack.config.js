const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const mode = isProd ? 'production' : 'development';
const devtool = isProd ? undefined : 'source-map';

const DIST = path.resolve(__dirname, 'dist');
const PUBLIC = path.resolve(__dirname, 'public');

module.exports = [{
    entry: './src/main.ts',
    target: 'web',
    mode,
    devtool,
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: [ 'ts-loader' ],
            exclude: /node_modules/,
        }],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'index.js',
        path: path.join(DIST, 'public'),
        publicPath: '/',
    },
    plugins: [
        new ESLintPlugin({
            extensions: [ 'js', 'ts', 'tsx' ],
        }),
        new CopyPlugin({
            patterns: [
                { from: path.posix.join(PUBLIC.replace(/\\/g, '/'), '**', '*'), to: DIST },
            ],
        }),
    ],
    devServer: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
}, {
    entry: './src/worker.ts',
    target: 'web',
    mode,
    devtool,
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: [ 'ts-loader' ],
            exclude: /node_modules/,
        }],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'worker.js',
        path: path.join(DIST, 'public'),
        publicPath: '/',
    },
    plugins: [
        new ESLintPlugin({
            extensions: [ 'js', 'ts', 'tsx' ],
        }),
        // new CopyPlugin({
        //     patterns: [
        //         { from: path.posix.join(PUBLIC.replace(/\\/g, '/'), '**', '*'), to: DIST },
        //     ],
        // }),
    ],
}];
