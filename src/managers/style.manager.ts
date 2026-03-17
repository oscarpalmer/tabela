import {
	CSS_BUTTON,
	CSS_CELL,
	CSS_CELL_FOOTER,
	CSS_CELL_GROUP,
	CSS_HEADING,
	CSS_HEADING_CONTENT,
	CSS_HEADING_SORTER,
	CSS_ROW,
	CSS_ROW_SELECTED,
	CSS_ROWGROUP_BODY,
	CSS_ROWGROUP_FOOTER,
	CSS_ROWGROUP_HEADER,
	CSS_SELECTION,
	CSS_TABLE,
	CSS_WRAPPER,
} from '../models/style.model';
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

:where(.${CSS_WRAPPER}) {
	flex: 1;
	position: relative;
	background-color: var(--oui-absolute);
	border: 1px solid grey;
}

:where(.${CSS_TABLE}) {
	min-height: 24em;
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	overflow: auto;
	position: absolute;
	inset: 0;
}

/** Row group */

:where(.${CSS_ROWGROUP_HEADER}),
:where(.${CSS_ROWGROUP_FOOTER}) {
	background-color: white;
	position: sticky;
	left: 0;
	z-index: 10;
}

:where(.${CSS_ROWGROUP_HEADER}) {
	top: 0;
}

:where(.${CSS_ROWGROUP_FOOTER}) {
	bottom: 0;
}

:where(.${CSS_ROWGROUP_BODY}) {
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
}

:where(.${CSS_ROWGROUP_BODY}:focus) {
	outline: none;
}

:where(.${CSS_WRAPPER}:has(.${CSS_ROWGROUP_BODY}:focus-visible)) {
	outline: 2px solid var(--oui-blue-6);
	outline-offset: 2px;
}

/** Row */

:where(.${CSS_ROW}) {
	width: 100%;
	display: flex;
	flex-flow: row nowrap;
}

:where(.${CSS_ROW}:last-child .${CSS_CELL}) {
	border-bottom-width: 0;
}

:where(.${CSS_ROW}--body),
:where(.${CSS_ROW}--group) {
	flex: 1;
	position: absolute;
}

:where(.${CSS_ROW_SELECTED}) {
	background-color: var(--oui-blue-1);
	color: var(--oui-blue-9);
}

:where(.${CSS_WRAPPER}:has(.${CSS_ROWGROUP_BODY}:focus-visible) .${CSS_ROW}[data-active="true"]) {
	outline: 2px solid var(--oui-blue-6);
	outline-offset: 2px;
}

/** Cells */

:where(.${CSS_CELL}),
:where(.${CSS_HEADING}) {
	padding: 0.5em;
	border-color: gray;
	border-style: solid;
	border-width: 0 1px 1px 0;
	line-height: 1;
}

:where(.${CSS_WRAPPER} .${CSS_CELL}:last-child),
:where(.${CSS_ROW} .${CSS_HEADING}:last-child) {
	flex: 1;
	border-right-width: 0;
}

:where(.${CSS_CELL}) {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

:where(.${CSS_HEADING}) {
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.5em;
	cursor: pointer;
}

:where(.${CSS_HEADING_CONTENT}) {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

:where(.${CSS_HEADING}[data-sort-direction] .${CSS_HEADING_SORTER})::after {
	width: 1em;
	height: 1em;
	display: inline-flex;
	font-size: .75em;
	font-weight: bold;
}

:where(.${CSS_HEADING}[data-sort-direction="ascending"] .${CSS_HEADING_SORTER})::after {
	content: '\\21C8';
}

:where(.${CSS_HEADING}[data-sort-direction="descending"] .${CSS_HEADING_SORTER})::after {
	content: '\\21CA';
}

:where(.${CSS_CELL_FOOTER}) {
	border-top-width: 1px;
	border-bottom-width: 0;
}

:where(.${CSS_CELL_GROUP}) {
	padding: 0;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: 0.5em;
}

:where(.${CSS_CELL_GROUP} .${CSS_BUTTON}) {
	margin: 0 0 0 .25rem;
}

/** Misc. */

:where(.${CSS_BUTTON}) {
	font-size: .75rem;
	font-weight: bold;
}

:where(.${CSS_SELECTION}) {
	background-color: color-mix(in oklch, var(--oui-blue-6), transparent);
	border: 1px solid var(--oui-blue-6);
	border-radius: .25rem;
	position: fixed;
	z-index: 1000;
}
`.replace(/^\s+|\s+|\s+$/g, ' ');

let appended = false;
