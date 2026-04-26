import {html} from '@oscarpalmer/abydon';
import {createTable} from '../misc/table';
import actions from './actions';

let count = 0;

const interval = setInterval(() => {
	if (count >= 1000) {
		clearInterval(interval);

		return;
	}

	const table = document.querySelector('#table');

	if (!(table instanceof HTMLElement)) {
		count += 1;

		return;
	}

	clearInterval(interval);

	createTable(table);
});

export default html`
	<main class="content stack">
		${actions}
		<div class="fill" id="table"></div>
	</main>
`;
