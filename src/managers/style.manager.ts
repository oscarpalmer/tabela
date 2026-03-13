import type {State} from '../models/tabela.model';

export class StyleManager {
	constructor(readonly state: State) {
		if (appended) {
			return;
		}

		const style = document.createElement('style');

		style.textContent = styling;

		document.head.appendChild(style);
	}
}

const styling = //css
	`.tabela__cell, .tabela__heading {
	padding: 0.5em;
	border-color: gray;
	border-style: solid;
	border-width: 0 1px 1px 0;
	line-height: 1;

	&:last-child {
		flex: 1;
		border-right-width: 0;
	}
}

.tabela__cell {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tabela__cell--footer {
	border-top-width: 1px;
}

.tabela {
	flex: 1;
	position: relative;
	background-color: var(--oui-absolute);
	border: 1px solid grey;
}

.tabela__table {
	min-height: 24em;
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	overflow: auto;
	position: absolute;
	inset: 0;
}

.tabela__rowgroup--header,
.tabela__rowgroup--footer {
	background-color: white;
	position: sticky;
	left: 0;
	z-index: 10;
}

.tabela__rowgroup--header {
	top: 0;
}

.tabela__rowgroup--footer {
	bottom: 0;
}

.tabela__rowgroup--body {
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
}

.tabela__rowgroup--body:focus {
	outline: none;
}

.tabela:has(.tabela__rowgroup--body:focus-visible) {
	outline: 2px solid var(--oui-blue-6);
	outline-offset: 2px;
}

.tabela__row {
	width: 100%;
	display: flex;
	flex-flow: row nowrap;

	&:last-child .tabela__cell {
		border-bottom-width: 0;
	}
}

.tabela__row--body,
.tabela__row--group {
	flex: 1;
	position: absolute;
}

.tabela__row--selected {
	background-color: var(--oui-blue-1);
	color: var(--oui-blue-9);
}

.tabela:has(.tabela__rowgroup--body:focus-visible) .tabela__row[data-active="true"] {
	outline: 2px solid var(--oui-blue-6);
	outline-offset: 2px;
}

.tabela__selection {
	background-color: color-mix(in oklch, var(--oui-blue-6), transparent);
	border: 1px solid var(--oui-blue-6);
	border-radius: .25rem;
	position: fixed;
	z-index: 1000;
`.replace(/\s+/g, ' ');

let appended = false;
