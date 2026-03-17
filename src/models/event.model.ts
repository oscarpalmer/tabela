import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaFilterItem} from './filter.model';
import type {TabelaGroup, TabelaGroupToggle} from './group.model';
import type {TabelaSortItem} from './sort.model';

export type EventDataAdd = (data: PlainObject[]) => void;

export type EventDataClear = () => void;

export type EventDataFiltered = (data: PlainObject[]) => void;

export type EventDataRemove = (data: PlainObject[]) => void;

export type EventDataSorted = (data: PlainObject[]) => void;

export type EventDataSynchronize = (data: {
	added: PlainObject[];
	removed: PlainObject[];
	updated: PlainObject[];
}) => void;

export type EventDataUpdate = (data: PlainObject[]) => void;

export type EventFilterAdd = (filters: TabelaFilterItem[]) => void;

export type EventFilterClear = () => void;

export type EventFilterRemove = (filters: TabelaFilterItem[]) => void;

export type EventGroupAdd = (groups: TabelaGroup[]) => void;

export type EventGroupClear = () => void;

export type EventGroupRemove = (groups: TabelaGroup[]) => void;

export type EventGroupToggle = (event: TabelaGroupToggle) => void;

export type EventGroupUpdate = (groups: TabelaGroup[]) => void;

export type EventMap = {
	'data:add': EventDataAdd;
	'data:clear': EventDataClear;
	'data:filtered': EventDataFiltered;
	'data:remove': EventDataRemove;
	'data:sorted': EventDataSorted;
	'data:synchronize': EventDataSynchronize;
	'data:update': EventDataUpdate;
	'filter:add': EventFilterAdd;
	'filter:clear': EventFilterClear;
	'filter:remove': EventFilterRemove;
	'group:add': EventGroupAdd;
	'group:clear': EventGroupClear;
	'group:remove': EventGroupRemove;
	'group:toggle': EventGroupToggle;
	'group:update': EventGroupUpdate;
	'navigation:active': EventNavigationActive;
	'render:begin': EventRenderBegin;
	'render:end': EventRenderEnd;
	'selection:add': EventSelectionAdd;
	'selection:clear': EventSelectionClear;
	'selection:remove': EventSelectionRemove;
	'selection:toggle': EventSelectionToggle;
	'sort:add': EventSortAdd;
	'sort:clear': EventSortClear;
	'sort:flip': EventSortFlip;
	'sort:remove': EventSortRemove;
	'sort:set': EventSortSet;
};

export type EventName = keyof EventMap;

export type EventNavigationActive = (active: Key | null) => void;

export type EventRenderBegin = () => void;

export type EventRenderEnd = () => void;

export type EventSelectionAdd = (keys: Key[]) => void;

export type EventSelectionClear = () => void;

export type EventSelectionRemove = (keys: Key[]) => void;

export type EventSelectionToggle = (keys: Key[]) => void;

export type EventSortAdd = (sorters: TabelaSortItem[]) => void;

export type EventSortClear = () => void;

export type EventSortFlip = (sorters: TabelaSortItem[]) => void;

export type EventSortRemove = (sorters: TabelaSortItem[]) => void;

export type EventSortSet = (sorters: {added: TabelaSortItem[]; removed: TabelaSortItem[]}) => void;

export type Events = Partial<{
	[Name in EventName]: Set<EventMap[Name]>;
}>;

export type TabelaEvents = {
	subscribe<Name extends EventName>(name: Name, callback: EventMap[Name]): void;
	unsubscribe<Name extends EventName>(name: Name, callback: EventMap[Name]): void;
};

export const EVENT_BODY = 'body';

export const EVENT_DATA_ADD = 'data:add';

export const EVENT_DATA_CLEAR = 'data:clear';

export const EVENT_DATA_FILTERED = 'data:filtered';

export const EVENT_DATA_REMOVE = 'data:remove';

export const EVENT_DATA_SORTED = 'data:sorted';

export const EVENT_DATA_SYNCHRONIZE = 'data:synchronize';

export const EVENT_DATA_UPDATE = 'data:update';

export const EVENT_GROUP = 'group';

export const EVENT_GROUP_ADD = 'group:add';

export const EVENT_GROUP_CLEAR = 'group:clear';

export const EVENT_GROUP_REMOVE = 'group:remove';

export const EVENT_GROUP_TOGGLE = 'group:toggle';

export const EVENT_GROUP_UPDATE = 'group:update';

export const EVENT_HEADING = 'heading';

export const EVENT_ROW = 'row';

export const EVENT_SORT_ADD = 'sort:add';

export const EVENT_SORT_CLEAR = 'sort:clear';

export const EVENT_SORT_FLIP = 'sort:flip';

export const EVENT_SORT_REMOVE = 'sort:remove';

export const EVENT_SORT_SET = 'sort:set';

export const EVENTS_NAMES = new Set<EventName>([
	EVENT_DATA_ADD,
	EVENT_DATA_CLEAR,
	EVENT_DATA_FILTERED,
	EVENT_DATA_REMOVE,
	EVENT_DATA_SORTED,
	EVENT_DATA_SYNCHRONIZE,
	EVENT_DATA_UPDATE,
	'filter:add',
	'filter:clear',
	'filter:remove',
	EVENT_GROUP_ADD,
	EVENT_GROUP_CLEAR,
	EVENT_GROUP_REMOVE,
	EVENT_GROUP_TOGGLE,
	EVENT_GROUP_UPDATE,
	'navigation:active',
	'render:begin',
	'render:end',
	'selection:add',
	'selection:clear',
	'selection:remove',
	'selection:toggle',
	EVENT_SORT_ADD,
	EVENT_SORT_CLEAR,
	EVENT_SORT_FLIP,
	EVENT_SORT_REMOVE,
	EVENT_SORT_SET,
] as const) satisfies ReadonlySet<EventName>;
