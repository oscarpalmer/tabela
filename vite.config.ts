import {defineConfig} from 'vite-plus';

export default defineConfig({
	base: './',
	pack: {
		deps: {
			alwaysBundle: /^@oscarpalmer/,
			onlyBundle: false,
		},
		dts: false,
		entry: ['./src/js/index.ts'],
		minify: 'dce-only',
		outDir: './dist/js',
		unbundle: false,
	},
});
