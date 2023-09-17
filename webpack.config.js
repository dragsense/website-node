const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
 
   module.exports = {
    entry: {
        'app-client': './src/client/components/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
         library: 'AppClient',
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
 
   /*   module.exports = {
    entry: {
        'autocode-server': './autocodeClient/server.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
         library: 'AutocodeServer',
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
    'react': 'react',
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
 }; */   
  
 
 /*    module.exports = {
    entry: {
        'autocode-client': './autocodeClient/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
         library: 'AutocodeClient',
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
    'AppClient': 'AppClient',
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
  */


//  module.exports = {
//     entry: {
//         'autocode': './autocode/app.js',
//     },
//     output: {
//         filename: '[name].js',
//         path: path.resolve(__dirname, 'dist'),
//          library: 'Autocode',
//          libraryTarget: 'umd',
//          globalObject: 'this',
//          publicPath: '',

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
//     externals: {
//         'react' :'react',
//         'react-dom' :'react-dom',
//         'mongoose': 'mongoose'
//     },
//     resolve: {
//         extensions: ['.js', '.jsx'],
//     },

//     optimization: {
//         minimizer: [
//             new TerserPlugin(),
//         ],
//     },
//     target: 'node',
//     mode: 'production',
//  }; 