import {on} from '@oscarpalmer/toretto/event';
import {onScroll} from '../helpers/render.helper';
import {type RenderManager} from '../models/render.model';
import type {State} from '../models/tabela.model';

// #region Instances

function RenderManager(this: RenderManager, state: State): void {
	this.listener = on(state.elements.table, 'scroll', onScroll.bind(this));
	this.state = state;
	this.top = 0;

	this.pool = {
		cells: {},
		rows: [],
	};

	this.visible = {
		indiced: new Map(),
		keys: new Set(),
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
	const {listener, pool, visible} = this;

	listener();

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

	this.fragment = undefined as never;
	this.listener = undefined as never;
	this.pool = undefined as never;
	this.state = undefined as never;
	this.visible = undefined as never;
}

// #endregion
