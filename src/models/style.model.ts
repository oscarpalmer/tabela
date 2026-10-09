import type {State} from './tabela.model';

// #region Types

export type StyleManager = {
	state: State;
};

// #endregion

// #region Variables

// #region CSS Classes

export const CSS_BUTTON = 'tabela__button';

export const CSS_BUTTON_GROUP = 'tabela__button--group';

export const CSS_CELL = 'tabela__cell';

export const CSS_CELL_BODY = 'tabela__cell--body';

export const CSS_CELL_FOOTER = 'tabela__cell--footer';

export const CSS_CELL_GROUP = 'tabela__cell--group';

export const CSS_FAKER = 'tabela__faker';

export const CSS_GROUP = 'tabela__group';

export const CSS_GROUP_SELECTED = 'tabela__group__selected';

export const CSS_GROUP_TOTAL = 'tabela__group__total';

export const CSS_HEADING = 'tabela__heading';

export const CSS_HEADING_CONTENT = 'tabela__heading__content';

export const CSS_HEADING_SORTER = 'tabela__heading__sorter';

export const CSS_ROW = 'tabela__row';

export const CSS_ROW_BODY = 'tabela__row--body';

export const CSS_ROW_FOOTER = 'tabela__row--footer';

export const CSS_ROW_GROUP = 'tabela__row--group tabela__group';

export const CSS_ROW_HEADER = 'tabela__row--header';

export const CSS_ROW_SELECTED = 'tabela__row--selected';

export const CSS_ROWGROUP = 'tabela__rowgroup';

export const CSS_ROWGROUP_BODY = 'tabela__rowgroup--body';

export const CSS_ROWGROUP_FOOTER = 'tabela__rowgroup--footer';

export const CSS_ROWGROUP_HEADER = 'tabela__rowgroup--header';

export const CSS_SELECTION = 'tabela__selection';

export const CSS_TABLE = 'tabela__table';

export const CSS_WRAPPER = 'tabela';

// #endregion

// #region CSS Selectors

// #endregion

export const SELECTOR_CELL: string = `.${CSS_CELL}`;

export const SELECTOR_GROUP_SELECTED: string = `.${CSS_GROUP_SELECTED}`;

export const SELECTOR_GROUP_TOTAL: string = `.${CSS_GROUP_TOTAL}`;

export const SELECTOR_ROW: string = `.${CSS_ROW}`;

export const SELECTOR_TABLE: string = `.${CSS_TABLE}`;

// #endregion

// #region CSS

export const tabelaCSS: string = //css
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

:where(.${CSS_WRAPPER}:has([data-active]:focus-visible)) {
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

:where(.${CSS_HEADING}[data-active]:focus-visible),
:where(.${CSS_CELL}[data-active]:focus-visible),
:where(.${CSS_CELL_FOOTER}[data-active]:focus-visible) {
	outline: 2px dashed red;
	outline-offset: -2px;
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

// #endregion
