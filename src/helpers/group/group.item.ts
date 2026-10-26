import {filter} from '@oscarpalmer/atoms/array/filter';
import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, Simplify} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {EVENT_GROUP_ADD, EVENT_GROUP_CLEAR, EVENT_GROUP_REMOVE} from '../../models/event.model';
import type {GroupComponent} from '../../models/group.model';
import type {State} from '../../models/tabela.model';
import {getTabelaGroup} from './group.misc';

// #region Functions

export function addGroups(state: State, groups: GroupComponent[]): void {
	if (groups.length === 0) {
		return;
	}

	setGroups(state, [...state.managers.group.items, ...groups]);

	state.managers.event.herald.emit(EVENT_GROUP_ADD, groups.map(getTabelaGroup));
}

export function clearGroups(state: State): void {
	const {event, group} = state.managers;

	if (group.items.length === 0) {
		return;
	}

	removeGroups(state, group.items.splice(0));

	group.collapsed.clear();

	event.herald.emit(EVENT_GROUP_CLEAR);
}

export function getGroup(state: State, value: Key, type: 'row'): GroupComponent | undefined;

export function getGroup(state: State, value: unknown, type: 'value'): GroupComponent | undefined;

export function getGroup(state: State, key: unknown): GroupComponent | undefined;

export function getGroup(
	state: State,
	value: unknown,
	type?: 'row' | 'value',
): GroupComponent | undefined {
	if (type == null) {
		return getGroupForKey(state, value);
	}

	if (type === 'value') {
		return getGroupForValue(state, value);
	}

	const {data, group} = state.managers;

	const item = data.store.values.mapped.get(value as Key);

	if (item == null) {
		return undefined;
	}

	return getGroupForValue(state, getValue(item, group.key, state.options.relaxedKeys));
}

export function getGroupForKey(state: State, key: unknown): GroupComponent | undefined {
	return typeof key === 'string' ? state.managers.group.mapped.get(key) : undefined;
}

export function getGroupForValue(state: State, value: unknown): GroupComponent | undefined {
	const asString = getString(value);

	return state.managers.group.items.find(item => item.value.stringified === asString);
}

export function removeGroup(group: GroupComponent): void {
	if (group.element == null) {
		return;
	}

	group.element.innerHTML = '';

	group.element.remove();
}

export function removeGroups(state: State, groups: GroupComponent[]): void {
	const {event, group} = state.managers;
	const {length} = groups;

	if (length === 0) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		removeGroup(groups[index]);
	}

	setGroups(
		state,
		filter(group.items, item => !groups.includes(item)),
	);

	event.herald.emit(EVENT_GROUP_REMOVE, groups.map(getTabelaGroup));
}

export function setGroups(state: State, groups: GroupComponent[]): void {
	const {group} = state.managers;

	group.items = sort(groups, (first, second) => compare(first.label, second.label));

	group.mapped = toMap(groups, group => group.key.full);

	group.order = toRecord(
		groups as Simplify<GroupComponent>[],
		group => group.value.stringified,
		(_, index) => index,
	);
}

// #endregion
