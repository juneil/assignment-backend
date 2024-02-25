const path = require('path');
const { readFileSync } = require('fs');
const { yamlParse } = require('yaml-cfn');
const glob = require('glob');
const nodeExternals = require('webpack-node-externals');
const { resolve } = require('path');

/**
 * Resolve tsconfig.json paths to Webpack aliases
 * @param  {string} tsconfigPath           - Path to tsconfig
 * @param  {string} webpackConfigBasePath  - Path from tsconfig to Webpack config to create absolute aliases
 * @return {object}                        - Webpack alias config
 */
function resolveTsconfigPathsToAlias({
    tsconfigPath = './tsconfig.json',
    webpackConfigBasePath = __dirname,
} = {}) {
    const { paths } = require(tsconfigPath).compilerOptions;

    const aliases = {};

    Object.keys(paths).forEach((item) => {
        const key = item.replace('/*', '');
        const value = resolve(webpackConfigBasePath, paths[item][0].replace('/*', '').replace('*', ''));

        aliases[key] = value;
    });

    return aliases;
}

const conf = {
    prodMode: process.env.NODE_ENV === 'production',
    templatePath: './template.yml'
};

const templatePaths = glob.sync('**/*.yml');
const resources = templatePaths
    .map(path => yamlParse(readFileSync(path)))
    .map(template => template.Resources || {})
    .reduce((acc, current) => ({ ...acc, ...current }), {});

const entries = Object.values(resources)
    .filter(v => v.Type === 'AWS::Serverless::Function')
    .map(v => ({
        // Isolate handler src filename
        handlerFile: v.Properties.Handler.split('.')[0],
        // Build handler dst path
        CodeUriDir: v.Properties.CodeUri.split('/')[2]
    }))
    .map(x=>(console.log(x), x))
    .reduce(
        (entries, v) =>
            Object.assign(
                entries,
                {
                    [`${v.CodeUriDir}/${v.handlerFile}`]: `./src/lambdas/${v.CodeUriDir}/${v.handlerFile}.ts`
                }
            ),
        {}
    );

console.log(`Building for ${conf.prodMode ? 'production' : 'development'}...`);
console.log(entries);

module.exports = {
    entry: entries,
    target: 'node',
    devtool: 'source-map',
    externals: conf.prodMode ? [nodeExternals()] : [],
    mode: conf.prodMode ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: ['/node_modules/aws-sdk']
            }
        ]
    },
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: resolveTsconfigPathsToAlias({})
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    }
};