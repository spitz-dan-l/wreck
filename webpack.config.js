const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// `npm run build` (production) bundles entry_points/build_prod.tsx.
// `npm run build-dev` (development) bundles entry_points/build_dev.tsx.
// Both write dist/venience.js, which dist/venience.html loads.
module.exports = (env, argv) => {
    const production = argv.mode === 'production';
    return {
        entry: production
            ? './src/typescript/entry_points/build_prod.tsx'
            : './src/typescript/entry_points/build_dev.tsx',
        output: {
            filename: 'venience.js',
            path: path.resolve(__dirname, 'dist'),
            clean: false
        },
        devtool: production ? false : 'source-map',
        resolve: {
            plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
            extensions: ['.ts', '.tsx', '.js', '.json']
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    // Type checking is done by `npm test` / `npm run typecheck`; the bundler only transpiles.
                    options: { transpileOnly: true }
                }
            ]
        },
        performance: { hints: false }
    };
};
