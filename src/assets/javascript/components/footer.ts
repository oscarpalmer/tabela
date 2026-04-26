import '@oscarpalmer/oui/popover';
import {html} from '@oscarpalmer/abydon';
import logs from './logs';

type Key = 'abydon' | 'atoms' | 'oui' | 'tabela' | 'toretto';

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
	toretto: {
		key: 'toretto',
		label: 'Toretto',
	},
};

function getLink(key: Key) {
	return `<a href="https://github.com/oscarpalmer/${links[key].key}">${links[key].label}</a>`;
}

export default html`
	<footer class="footer flow flex-ai--fs flex-jc--sb">
		<div class="stack stack--small">
			<p>&copy 2026, Oscar Palmér</p>
			<p>Built with ${getLink('abydon')}, ${getLink('atoms')}, ${getLink('oui')}, ${getLink('tabela')}, and ${getLink('toretto')}.</p>
		</div>
		${logs}
	</footer>
`;
