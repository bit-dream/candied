import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    // Default exports for commonjs, es, and umd
    {
        input: './lib/index.js',
        output: [
            {
                file: './dist/index.cjs.js',
                format: 'cjs',
            },
            {
                file: './dist/index.es.js',
                format: 'es',
            },
            {
                file: './dist/index.umd.js',
                name: 'candied',
                format: 'umd',
            },
        ],
        plugins: [typescript()],
    },
    {
        input: './lib/filesystem/index.js',
        output: [
            {
                file: './dist/filesystem/index.cjs.js',
                format: 'cjs',
            }
        ],
        plugins: [typescript()],
    },
    // Bundled and minified outputs
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist-bundle/candied.js',
                format: 'umd',
                sourcemap: false,
                name: 'candied'
            }
        ],
        plugins: [
            typescript(),
            terser({sourceMap: false})
        ]
    },
    {
        input: 'src/filesystem/DbcWebFs.ts',
        output: [
            {
                file: 'dist-bundle/candied-fs.js',
                format: 'es',
                sourcemap: false
            }
        ],
        plugins: [
            typescript(),
            terser({sourceMap: false})
        ]
    }
];
