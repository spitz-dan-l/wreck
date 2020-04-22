// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const EvalSourceMapDevToolPlugin = require('webpack').EvalSourceMapDevToolPlugin;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const path = require('path');

module.exports = {
    entry: "./src/typescript/main.tsx",
    output: {
        filename: "venience.js",
        path: path.resolve(__dirname, "dist")
    },

    devtool: 'source-map',//false,

    resolve: {
        plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
        // alias: { handlebars: 'handlebars/dist/handlebars.min.js' }
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader", options: { transpileOnly: true} }
        ]
    },
    // module: {
    //     rules: [
    //         { test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ },
    //     ]
    // },

    // plugins: [
    //     // NOTE: the Eval plugin actually follows the exclude: option, while the vanilla one just doesn't. Dumb.
    //     new EvalSourceMapDevToolPlugin({
    //         test: /\.(ts|js)x?$/,
    //         exclude: /node_modules/
    //     })
    // ]
};
