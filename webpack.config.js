const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

  /*  module.exports = {
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
 externals: {
    'react': 'React',
     
  },
    optimization: {
        minimizer: [
            new TerserPlugin(),
        ],
    },

    mode: 'production',
 };    */
 


  module.exports = {
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
    'react': 'react',
    'mathjs': 'mathjs',
    'react-dom': 'react-dom'
     
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
 
    
/* 
 
 const { dependencies } = require('./package.json');

// Automatically mark all dependencies as externals
const externals = Object.keys(dependencies).reduce((externalsObj, dep) => {
    externalsObj[dep] = dep;
    return externalsObj;
}, {
    'mongodb': 'mongodb', // Additional external library
    'react-dom/server': 'react-dom/server',
    //'../dist/autocode-services': '../dist/autocode-services'
});

  module.exports = {
    entry: {
        'autocode-services': './autocode/apis/services/index.js',
        //'autocode': './autocode/app.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: '[name]',
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
    externals,
    resolve: {
        extensions: ['.js', '.jsx'],
    },

    optimization: {
        minimizer: [
            new TerserPlugin(),
        ],
       
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
    ],
    target: 'node',
    mode: 'production',
 };        */