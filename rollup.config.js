import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist-bundle/candied.js',
                format: 'cjs',
                sourcemap: false
            }
        ],
        plugins: [
            typescript({
                module: "ESNext"
            }),
            commonjs(),
            terser({sourceMap: false})
        ]
    },
    {
        input: 'src/filesystem/DbcWebFs.ts',
        output: [
            {
                file: 'dist-bundle/candied-fs.js',
                format: 'cjs',
                sourcemap: false
            }
        ],
        plugins: [
            typescript({
                module: "ESNext"
            }),
            commonjs(),
            terser({sourceMap: false})
        ]
    }
]