import {defineConfig} from 'tsdown';

const timestamp = process.env.TIMESTAMP;

export default defineConfig({
	copy: [
		{
			from: './build/assets/javascript/index.mjs',
			to: './build/assets/javascript',
			rename: `app.${timestamp}.mjs`,
		},
	],
	deps: {
		alwaysBundle: /^@oscarpalmer/,
		onlyBundle: false,
	},
	dts: false,
	entry: ['./src/assets/javascript/index.ts'],
	ignoreWatch: ['build/**', 'node_modules/**'],
	minify: 'dce-only',
	outDir: './build/assets/javascript',
	tsconfig: './tsconfig.local.json',
	unbundle: false,
});
