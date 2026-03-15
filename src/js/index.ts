import '@oscarpalmer/abydon';
import '@oscarpalmer/tabela';

import {html} from '@oscarpalmer/abydon';
import content from './components/content';
import footer from './components/footer';
import header from './components/header';

html`${header}${content}${footer}`.appendTo(document.body);

setTimeout(() => {
	const loading = document.querySelector('#loading');

	if (!(loading instanceof HTMLElement)) {
		return;
	}

	loading.style.opacity = '0';

	setTimeout(() => {
		loading.innerHTML = '';

		loading.remove();
	}, 250);
}, 500);
