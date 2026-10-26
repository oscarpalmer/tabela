import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getData, setData} from '../helpers/data/data.misc';
import {removeGroup} from '../helpers/group/group.item';
import type {GroupManager, TabelaGroup} from '../models/group.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function GroupManager(this: GroupManager, state: State): void {
	this.collapsed = new Set<Key>();
	this.enabled = false;
	this.items = [];
	this.mapped = new Map();
	this.order = {};
	this.state = state;

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaGroup(this);

	const {key} = state.options.grouping ?? {};

	if (isNullableOrWhitespace(key)) {
		return;
	}

	this.enabled = true;
	this.key = key;
}

GroupManager.prototype.destroy = destroyGroupManager;

function TabelaGroup(this: TabelaGroup, state: State): void {
	this[SYMBOL] = state;
}

TabelaGroup.prototype.set = setTabelaGrouping;

// #endregion

// #region Functions

export function createGroupManager(state: State): GroupManager {
	// @ts-expect-error All good, no worries :-)
	return new GroupManager(state);
}

function destroyGroupManager(this: GroupManager): void {
	const groups = this.items.splice(0);
	const {length} = groups;

	for (let index = 0; index < length; index += 1) {
		removeGroup(groups[index]);
	}

	this.collapsed.clear();

	this.handlers = undefined as never;
	this.state = undefined as never;
}

function setTabelaGrouping(this: TabelaGroup, key?: string): void {
	const state = this[SYMBOL];
	const manager = state.managers.group;

	if (key === manager.key) {
		return;
	}

	manager.enabled = !isNullableOrWhitespace(key);
	manager.key = key ?? '';

	void setData(state, getData(state));
}

// #endregion
