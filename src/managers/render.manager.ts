import {on} from '@oscarpalmer/toretto/event';
import {onResize, onScroll, onScrollEnd} from '../helpers/render.helper';
import {type RenderManager} from '../models/render.model';
import type {State} from '../models/tabela.model';

// #region Instances

function RenderManager(this: RenderManager, state: State): void {
	const {table} = state.elements;

	const ended = onScrollEnd.bind(this);

	this.listener = on(table, 'scroll', onScroll.bind(this));
	this.offsets = [];
	this.state = state;
	this.top = 0;

	this.estimate = {
		count: 0,
		total: 0,
		value: state.options.rowHeight,
	};

	this.observer = new ResizeObserver(onResize.bind(this));

	this.pool = {
		cells: {},
		rows: [],
	};

	this.scroll = {
		active: false,
		ended,
		listener: 'onscrollend' in table ? on(table, 'scrollend', ended) : undefined,
	};

	this.visible = {
		indiced: new Map(),
		keys: new Map(),
	};
}

RenderManager.prototype.destroy = destroyRenderManager;

// #endregion

// #region Functions

export function createRenderManager(state: State): RenderManager {
	// @ts-expect-error All good, no worries :-)
	return new RenderManager(state);
}

function destroyRenderManager(this: RenderManager): void {
	const {listener, offsets, pool, scroll, visible} = this;

	listener();

	scroll.listener?.();

	clearTimeout(scroll.timeout);

	offsets.length = 0;

	visible.indiced.clear();
	visible.keys.clear();

	const cells = Object.values(pool.cells).flat();

	let {length} = cells;

	for (let index = 0; index < length; index += 1) {
		cells[index].remove();
	}

	length = pool.rows.length;

	for (let index = 0; index < length; index += 1) {
		pool.rows[index].remove();
	}

	pool.cells = {};
	pool.rows = [];

	this.estimate = undefined as never;
	this.fragment = undefined as never;
	this.listener = undefined as never;
	this.offsets = undefined as never;
	this.pool = undefined as never;
	this.scroll = undefined as never;
	this.state = undefined as never;
	this.visible = undefined as never;
}

// #endregion
