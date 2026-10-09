import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {removeGroup} from '../helpers/group.helper';
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

	if (isNullableOrWhitespace(state.options.grouping)) {
		return;
	}

	this.enabled = true;
	this.key = state.options.grouping;
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
	const {managers} = this[SYMBOL];
	const manager = managers.group;

	if (key === manager.key) {
		return;
	}

	manager.enabled = !isNullableOrWhitespace(key);
	manager.key = key ?? '';

	managers.data.set(managers.data.get());
}

// #endregion
