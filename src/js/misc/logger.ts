import {array} from '@oscarpalmer/abydon';
import type {Tabela} from '@oscarpalmer/tabela';

export type Log = {
	color: string;
	id: number;
	name: keyof typeof events;
	message: string;
	timestamp: Date;
	type: string;
};

function addLog(name: keyof typeof events, message: string): void {
	const log: Log = {
		name,
		message,
		color: getColor(name),
		id: getId(),
		timestamp: new Date(),
		type: name.split(':')[0],
	};

	if (logs.peek('length') < 100) {
		logs.push(log);

		return;
	}

	logs.update(items => {
		items.shift();

		items.push(log);

		return items;
	});
}

function getColor(name: string): string {
	const event = name.split(':')[1];

	switch (true) {
		case /add/.test(event):
			return 'green';

		case /clear|remove/.test(event):
			return 'red';

		case /sync/.test(event):
			return 'purple';

		case /update/.test(event):
			return 'blue';

		default:
			return 'neutral';
	}
}

function getId(): number {
	id += 1;

	return id;
}

function onAddData(data: unknown[]): void {
	addLog('data:add', `Adding ${data.length} items`);
}

function onAddFilter(filters: unknown[]): void {
	addLog('filter:add', `Adding ${filters.length} filters`);
}

function onAddGroups(groups: unknown[]): void {
	addLog('group:add', `Adding ${groups.length} groups`);
}

function onAddSorters(sorters: unknown[]): void {
	addLog('sort:add', `Adding ${sorters.length} sorters`);
}

function onClearData(): void {
	addLog('data:clear', 'Clearing data');
}

function onClearFilters(): void {
	addLog('filter:clear', 'Clearing filters');
}

function onClearGroups(): void {
	addLog('group:clear', 'Clearing groups');
}

export function onClearLogs(): void {
	logs.clear();
}

function onClearSorters(): void {
	addLog('sort:clear', 'Clearing sorters');
}

function onFlipSorters(sorters: unknown[]): void {
	addLog('sort:flip', `Flipping ${sorters.length} sorters`);
}

function onRemoveData(data: unknown[]): void {
	addLog('data:remove', `Removing ${data.length} items`);
}

function onRemoveFilter(filters: unknown[]): void {
	addLog('filter:remove', `Removing ${filters.length} filters`);
}

function onRemoveGroups(groups: unknown[]): void {
	addLog('group:remove', `Removing ${groups.length} groups`);
}

export function onRemoveLog(event: Event, id: number): void {
	event.stopPropagation();

	logs.update(items => items.filter(item => item.id !== id));
}

function onRemoveSorters(sorters: unknown[]): void {
	addLog('sort:remove', `Removing ${sorters.length} sorters`);
}

function onSetFilters(filters: unknown[]): void {
	addLog('filter:set', `Setting ${filters.length} filters`);
}

function onSetSorters(sorters: unknown[]): void {
	addLog('sort:set', `Setting ${sorters.length} sorters`);
}

function onSortedData(data: unknown[]): void {
	addLog('data:sorted', `Sorted ${data.length} items`);
}

function onSynchronizeData(data: {added: unknown[]; removed: unknown[]; updated: unknown[]}): void {
	addLog(
		'data:synchronize',
		`Synchronizing ${data.added.length + data.removed.length + data.updated.length} items`,
	);
}

function onToggleGroups(event: {collapsed: unknown[]; expanded: unknown[]}): void {
	addLog(
		'group:toggle',
		`Collapsing ${event.collapsed.length} groups; expanding ${event.expanded.length} groups`,
	);
}

function onUpdateData(data: unknown[]): void {
	addLog('data:update', `Updating ${data.length} items`);
}

function onUpdateGroups(groups: unknown[]): void {
	addLog('group:update', `Updating ${groups.length} groups`);
}

export function setupLogger(tabel: Tabela): void {
	for (const name of names) {
		const calllback = events[name];

		if (calllback != null) {
			tabel.events.subscribe(name, calllback);
		}
	}
}

export const logs = array<Log>([]);

const names = [
	'data:add',
	'data:clear',
	'data:filtered',
	'data:remove',
	'data:sorted',
	'data:synchronize',
	'data:update',
	'filter:add',
	'filter:clear',
	'filter:remove',
	'filter:set',
	'group:add',
	'group:clear',
	'group:remove',
	'group:toggle',
	'group:update',
	'navigation:active',
	'render:begin',
	'render:end',
	'selection:add',
	'selection:clear',
	'selection:remove',
	'selection:toggle',
	'sort:add',
	'sort:clear',
	'sort:flip',
	'sort:remove',
	'sort:set',
] as const;

const events: Partial<Record<(typeof names)[number], (...args: any[]) => void>> = {
	'data:add': onAddData,
	'data:clear': onClearData,
	'data:remove': onRemoveData,
	'data:sorted': onSortedData,
	'data:synchronize': onSynchronizeData,
	'data:update': onUpdateData,
	'filter:add': onAddFilter,
	'filter:clear': onClearFilters,
	'filter:remove': onRemoveFilter,
	'filter:set': onSetFilters,
	'group:add': onAddGroups,
	'group:clear': onClearGroups,
	'group:remove': onRemoveGroups,
	'group:toggle': onToggleGroups,
	'group:update': onUpdateGroups,
	'sort:add': onAddSorters,
	'sort:clear': onClearSorters,
	'sort:flip': onFlipSorters,
	'sort:remove': onRemoveSorters,
	'sort:set': onSetSorters,
};

let id = 0;
