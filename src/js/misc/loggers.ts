import type {Tabela} from '@oscarpalmer/tabela';

function onAddData(data: unknown[]): void {
	console.log('data:add', `Adding ${data.length} items`, data);
}

function onAddFilter(filters: unknown[]): void {
	console.log('filter:add', `Adding ${filters.length} filters`, filters);
}

function onAddGroups(groups: unknown[]): void {
	console.log('group:add', `Adding ${groups.length} groups`, groups);
}

function onAddSorters(sorters: unknown[]): void {
	console.log('sort:add', `Adding ${sorters.length} sorters`, sorters);
}

function onClearData(): void {
	console.log('data:clear', 'Clearing data');
}

function onClearFilters(): void {
	console.log('filter:clear', 'Clearing filters');
}

function onClearGroups(): void {
	console.log('group:clear', 'Clearing groups');
}

function onClearSorters(): void {
	console.log('sort:clear', 'Clearing sorters');
}

function onFlipSorters(sorters: unknown[]): void {
	console.log('sort:flip', `Flipping ${sorters.length} sorters`, sorters);
}

function onRemoveData(data: unknown[]): void {
	console.log('data:remove', `Removing ${data.length} items`, data);
}

function onRemoveFilter(filters: unknown[]): void {
	console.log('filter:remove', `Removing ${filters.length} filters`, filters);
}

function onRemoveGroups(groups: unknown[]): void {
	console.log('group:remove', `Removing ${groups.length} groups`, groups);
}

function onRemoveSorters(sorters: unknown[]): void {
	console.log('sort:remove', `Removing ${sorters.length} sorters`, sorters);
}

function onSetFilters(filters: unknown[]): void {
	console.log('filter:set', `Setting ${filters.length} filters`, filters);
}

function onSetSorters(sorters: unknown[]): void {
	console.log('sort:set', `Setting ${sorters.length} sorters`, sorters);
}

function onSortedData(data: unknown[]): void {
	console.log('data:sorted', `Sorted ${data.length} items`, data);
}

function onSynchronizeData(data: {added: unknown[]; removed: unknown[]; updated: unknown[]}): void {
	console.log(
		'data:synchronize',
		`Synchronizing ${data.added.length + data.removed.length + data.updated.length} items`,
		data,
	);
}

function onToggleGroups(event: {collapsed: unknown[]; expanded: unknown[]}): void {
	console.log(
		'group:toggle',
		`Collapsing ${event.collapsed.length} groups; expanding ${event.expanded.length} groups`,
		event,
	);
}

function onUpdateData(data: unknown[]): void {
	console.log('data:update', `Updating ${data.length} items`, data);
}

function onUpdateGroups(groups: unknown[]): void {
	console.log('group:update', `Updating ${groups.length} groups`, groups);
}

export function setupLoggers(tabel: Tabela): void {
	for (const name of names) {
		const calllback = events[name];

		if (calllback != null) {
			tabel.events.subscribe(name, calllback);
		}
	}
}

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
