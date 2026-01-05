import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    // External all workspace packages to avoid bundling duplicates
    external: [
        '@trezoa-commerce/connector',
        '@trezoa-commerce/headless',
        '@trezoa-commerce/react',
        '@trezoa-commerce/sdk',
        '@trezoa-commerce/trezoa-pay',
        'react',
        'react-dom',
    ],
});
