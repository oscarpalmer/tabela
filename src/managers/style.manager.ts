import type {State} from '../models/tabela.model';

export class StyleManager {
	constructor(readonly state: State) {
		if (appended) {
			return;
		}

		appended = true;

		const style = document.createElement('style');

		style.textContent = styling;

		document.head.appendChild(style);
	}
}

const styling = //css
	`/** Table */

:where(.tabela) {
	flex: 1;
	position: relative;
	background-color: var(--oui-absolute);
	border: 1px solid grey;
}

:where(.tabela__table) {
	min-height: 24em;
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	overflow: auto;
	position: absolute;
	inset: 0;
}

/** Row group */

:where(.tabela__rowgroup--header),
:where(.tabela__rowgroup--footer) {
	background-color: white;
	position: sticky;
	left: 0;
	z-index: 10;
}

:where(.tabela__rowgroup--header) {
	top: 0;
}

:where(.tabela__rowgroup--footer) {
	bottom: 0;
}

:where(.tabela__rowgroup--body) {
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
}

:where(.tabela__rowgroup--body:focus) {
	outline: none;
}

:where(.tabela:has(.tabela__rowgroup--body:focus-visible)) {
	outline: 2px solid var(--oui-blue-6);
	outline-offset: 2px;
}

/** Row */

:where(.tabela__row) {
	width: 100%;
	display: flex;
	flex-flow: row nowrap;
}

:where(.tabela__row:last-child .tabela__cell) {
	border-bottom-width: 0;
}

:where(.tabela__row--body),
:where(.tabela__row--group) {
	flex: 1;
	position: absolute;
}

:where(.tabela__row--selected) {
	background-color: var(--oui-blue-1);
	color: var(--oui-blue-9);
}

:where(.tabela:has(.tabela__rowgroup--body:focus-visible) .tabela__row[data-active="true"]) {
	outline: 2px solid var(--oui-blue-6);
	outline-offset: 2px;
}

/** Cells */

:where(.tabela__cell),
:where(.tabela__heading) {
	padding: 0.5em;
	border-color: gray;
	border-style: solid;
	border-width: 0 1px 1px 0;
	line-height: 1;
}

:where(.tabela__row .tabela__cell:last-child),
:where(.tabela__row .tabela__heading:last-child) {
	flex: 1;
	border-right-width: 0;
}

:where(.tabela__cell) {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

:where(.tabela__cell--footer) {
	border-top-width: 1px;
	border-bottom-width: 0;
}

:where(.tabela__cell--group) {
	padding: 0;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: 0.5em;
}

:where(.tabela__cell--group .tabela__button) {
	margin: 0 0 0 .25rem;
}

/** Misc. */

:where(.tabela__button) {
	font-size: .75rem;
	font-weight: bold;
}

:where(.tabela__selection) {
	background-color: color-mix(in oklch, var(--oui-blue-6), transparent);
	border: 1px solid var(--oui-blue-6);
	border-radius: .25rem;
	position: fixed;
	z-index: 1000;
}
`.replace(/^\s+|\s+|\s+$/g, ' ');

let appended = false;
