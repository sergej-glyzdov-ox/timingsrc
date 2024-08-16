import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// eslint-disable-next-line import/no-default-export
export default {
    input: 'build/es2019/module.js',
    output: {
        file: 'build/es5/bundle.js',
        format: 'cjs',
        name: 'timingsrc'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({
            babelHelpers: 'runtime',
            exclude: 'node_modules/**',
            plugins: ['@babel/plugin-external-helpers', '@babel/plugin-transform-runtime'],
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            chrome: '38'
                        },
                        modules: false
                    }
                ]
            ]
        })
    ]
};
