import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default [
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
            typescript({
                module: "ESNext"
            }),
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
            typescript({
                module: "ESNext"
            }),
            terser({sourceMap: false})
        ]
    }
]