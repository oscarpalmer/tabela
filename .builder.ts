import {concurrently} from 'concurrently';
import {minify} from 'html-minifier';
import {exec} from 'node:child_process';
import {copyFile, mkdir, readFile, rm, unlink, writeFile} from 'node:fs/promises';
import {compileStringAsync} from 'sass';
import {build} from 'tsdown';

const timestamp = Date.now();

const watch = process.argv.includes('--watch');

async function copyFiles(): Promise<void> {
	console.log('--- Copying files');

	await copyFile('./src/robots.txt', './build/robots.txt');

	console.log('  ✓ Copied files');
}

async function createHtml(): Promise<void> {
	console.log('--- Creating HTML');

	const original = await readFile('./src/index.html', 'utf-8');

	const timestamped = original.replaceAll('{{ timestamp }}', String(timestamp));

	await writeFile(
		'./build/index.html',
		watch
			? timestamped
			: minify(timestamped, {
					collapseWhitespace: true,
					decodeEntities: true,
					minifyCSS: true,
					removeComments: true,
				}),
	);

	console.log('  ✓ Created HTML');
}

async function createJavaScript(): Promise<void> {
	console.log('--- Creating JavaScript');

	await build({
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
		logLevel: 'silent',
		minify: true,
		outDir: './build/assets/javascript',
		unbundle: false,
	});

	await unlink('./build/assets/javascript/index.mjs');

	console.log('  ✓ Created JavaScript');
}

async function createStylesheets(): Promise<void> {
	console.log('--- Creating stylesheets');

	const source = await readFile('./src/assets/stylesheets/styles.scss', 'utf-8');

	const compiled = await compileStringAsync(source, {
		importers: [
			{
				findFileUrl(url) {
					let prefix = './src/assets/stylesheets/';

					if (url.startsWith('@oscarpalmer')) {
						prefix = './node_modules/';
					}

					return new URL(`${prefix}${url}`, import.meta.url);
				},
			},
		],
		style: 'compressed',
	}).catch(error => {
		console.log(error);

		return {
			css: '',
		};
	});

	await writeFile(`./build/assets/stylesheets/styles.${timestamp}.css`, compiled.css);

	console.log('  ✓ Created stylesheets');
}

async function installDependencies(): Promise<void> {
	console.log('--- Installing dependencies');

	await installDependency('abydon');
	await installDependency('atoms');
	await installDependency('oui');
	await installDependency('tabela');
	await installDependency('toretto');

	console.log('  ✓ Installed dependencies');
}

async function installDependency(name: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		exec(`cd node_modules/@oscarpalmer/${name} && npm i`, error => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

async function prepare(): Promise<void> {
	console.log('--- Preparing build directory');

	await rm('./build', {recursive: true, force: true});

	await mkdir('./build/assets/javascript', {recursive: true});
	await mkdir('./build/assets/stylesheets', {recursive: true});

	console.log('  ✓ Prepared build directory');
}

await prepare();
await copyFiles();
await createHtml();

if (watch) {
	const {result} = concurrently([
		`npx sass --watch --no-source-map src/assets/stylesheets/styles.local.scss:build/assets/stylesheets/styles.${timestamp}.css`,
		`TIMESTAMP=${timestamp} npx tsdown -c ./tsdown.config.ts --watch`,
	]);

	await result.then(() => {}).catch(() => {});
} else {
	await installDependencies();
	await createJavaScript();
	await createStylesheets();
}

console.log('--- Build complete');
