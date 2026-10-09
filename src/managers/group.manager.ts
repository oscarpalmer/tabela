import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key, Simplify} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {removeGroup, updateGroup} from '../components/group.component';
import {getTabelaGroup} from '../helpers/misc.helpers';
import {
	EVENT_GROUP_ADD,
	EVENT_GROUP_CLEAR,
	EVENT_GROUP_REMOVE,
	EVENT_GROUP_TOGGLE,
	EVENT_GROUP_UPDATE,
} from '../models/event.model';
import type {GroupComponent, GroupManager, TabelaGroup} from '../models/group.model';
import {RENDER_ORIGIN_DATA} from '../models/render.model';
import {SYMBOL, type State} from '../models/tabela.model';
import {focusNavigation} from './navigation.manager';
import {render} from './render.manager';

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

export function addGroups(state: State, groups: GroupComponent[]): void {
	if (groups.length === 0) {
		return;
	}

	setGroups(state, [...state.managers.group.items, ...groups]);

	state.managers.event.herald.emit(EVENT_GROUP_ADD, groups.map(getTabelaGroup));
}

export function clearGroups(state: State): void {
	if (state.managers.group.items.length === 0) {
		return;
	}

	removeGroups(state, state.managers.group.items.splice(0));

	state.managers.group.collapsed.clear();

	state.managers.event.herald.emit(EVENT_GROUP_CLEAR);
}

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

export function getGroup(state: State, value: unknown, forValue: true): GroupComponent | undefined;

export function getGroup(state: State, key: unknown): GroupComponent | undefined;

export function getGroup(
	state: State,
	keyOrValue: unknown,
	forValue?: unknown,
): GroupComponent | undefined {
	return forValue === true
		? getGroupForValue(state, keyOrValue)
		: getGroupForKey(state, keyOrValue);
}

function getGroupForKey(state: State, key: unknown): GroupComponent | undefined {
	return typeof key === 'string' ? state.managers.group.mapped.get(key) : undefined;
}

function getGroupForValue(state: State, value: unknown): GroupComponent | undefined {
	const asString = getString(value);

	return state.managers.group.items.find(item => item.value.stringified === asString);
}

export function onGroup(state: State, button: HTMLElement): void {
	const key = button.dataset.key?.replace(`${state.prefix}_`, '');
	const group = getGroupForKey(state, key ?? '');

	if (group != null) {
		toggleGroup(state, group);
	}
}

export function removeGroups(state: State, groups: GroupComponent[]): void {
	const {length} = groups;

	if (length === 0) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		removeGroup(groups[index]);
	}

	setGroups(
		state,
		state.managers.group.items.filter(item => !groups.includes(item)),
	);

	state.managers.event.herald.emit(EVENT_GROUP_REMOVE, groups.map(getTabelaGroup));
}

export function setGroups(state: State, groups: GroupComponent[]): void {
	state.managers.group.items = sort(groups, (first, second) => compare(first.label, second.label));

	state.managers.group.mapped = toMap(groups, group => group.key.full);

	state.managers.group.order = toRecord(
		groups as Simplify<GroupComponent>[],
		group => group.value.stringified,
		(_, index) => index,
	);
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

export function toggleGroup(state: State, group: GroupComponent): void {
	const {collapsed, items} = state.managers.group;

	group.expanded = !group.expanded;

	const index = items.indexOf(group);

	let first = state.managers.data.data.keys.original.indexOf(group.key.full) + 1;

	const last =
		items[index + 1] == null
			? state.managers.data.data.keys.original.length - 1
			: state.managers.data.data.keys.original.indexOf(items[index + 1].key.full) - 1;

	for (; first <= last; first += 1) {
		const key = state.managers.data.data.keys.original[first] as Key;

		if (group.expanded) {
			collapsed.delete(key);
		} else {
			collapsed.add(key);
		}
	}

	state.managers.event.herald.emit(EVENT_GROUP_TOGGLE, {
		collapsed: group.expanded ? [] : [getTabelaGroup(group)],
		expanded: group.expanded ? [getTabelaGroup(group)] : [],
	});

	render(state, RENDER_ORIGIN_DATA);

	focusNavigation(state);
}

export function updateGroups(state: State, groups: GroupComponent[]): void {
	const {length} = groups;

	if (length === 0) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		updateGroup(state, groups[index], false);
	}

	state.managers.event.herald.emit(EVENT_GROUP_UPDATE, groups.map(getTabelaGroup));
}

// #endregion
