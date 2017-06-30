module.exports = {
    entry: "./src/tsx/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    useBabel: true,
                    useCache: true,
                }
            },

        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "immutable": "Immutable"
    },
};
