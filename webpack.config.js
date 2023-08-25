const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const LoadablePlugin = require('@loadable/webpack-plugin');


module.exports = {
    entry: {
        autocode: './src/components/Page/index.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'autocode'),
         library: 'Autocode',
         libraryExport: 'default',
         libraryTarget: 'umd',
         globalObject: 'this',
        publicPath: '',

    },
   
    module: {
        rules: [

            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
        ],
    },
    externals: {
        'react': 'react'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },

    optimization: {
        minimizer: [
            new TerserPlugin(),
        ],
    },
    mode: 'production',
 };


// const path = require('path');
// const TerserPlugin = require('terser-webpack-plugin');
// const webpack = require('webpack');


// module.exports = {
//     entry: {
//         custom: './src/components/Custom/index.js',
//     },
//     output: {
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'autocode'),
//         library: 'AutocodeCustom',
//         libraryExport: 'default',
//          libraryTarget: 'umd',
//          globalObject: 'this',
//         publicPath: '',

//     },
   
//     module: {
//         rules: [

//             {
//                 test: /\.(js|jsx)$/,
//                 exclude: /node_modules/,
//                 use: {
//                     loader: 'babel-loader',

//                     options: {
//                         presets: ['@babel/preset-env', '@babel/preset-react'],
//                     },
//                 },
//             },
//         ],
//     },
  
//     resolve: {
//         extensions: ['.js', '.jsx'],
//     },

//     optimization: {
//         minimizer: [
//             new TerserPlugin(),
//         ],
//     },

//     mode: 'production',
// };

