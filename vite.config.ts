import {defineConfig, minify} from 'vite';

export default defineConfig({
	base: './',
	pack: {
		dts: false,
		entry: ['./src/**/*.ts'],
		minify: 'dce-only',
		outDir: './dist/js',
		unbundle: false,
	},
});
