import {html} from '@oscarpalmer/abydon';

type Key = 'abydon' | 'atoms' | 'oui' | 'tabela';

type Link = {
	key: string;
	label: string;
};

const links: Record<Key, Link> = {
	abydon: {
		key: 'abydon',
		label: 'Abydon',
	},
	atoms: {
		key: 'atoms',
		label: 'Atoms',
	},
	oui: {
		key: 'oui',
		label: 'Oui',
	},
	tabela: {
		key: 'tabela',
		label: 'Tabela',
	},
};

function getLink(key: Key) {
	return `<a href="https://github.com/oscarpalmer/${links[key].key}">${links[key].label}</a>`;
}

export default html`
	<footer class="footer stack stack--small">
		<p>&copy 2026, Oscar Palmér</p>
		<p>Built with ${getLink('abydon')}, ${getLink('atoms')}, ${getLink('oui')}, and ${getLink('tabela')}.</p>
	</footer>
`;
