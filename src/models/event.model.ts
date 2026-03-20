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

export type EventFilterSet = (filters: {
	added: TabelaFilterItem[];
	removed: TabelaFilterItem[];
}) => void;

export type EventGroupAdd = (groups: TabelaGroup[]) => void;

export type EventGroupClear = () => void;

export type EventGroupRemove = (groups: TabelaGroup[]) => void;

export type EventGroupToggle = (event: TabelaGroupToggle) => void;

export type EventGroupUpdate = (groups: TabelaGroup[]) => void;

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

export const EVENT_FILTER_ADD = 'filter:add';

export const EVENT_FILTER_CLEAR = 'filter:clear';

export const EVENT_FILTER_REMOVE = 'filter:remove';

export const EVENT_FILTER_SET = 'filter:set';

export const EVENT_HEADING = 'heading';

export const EVENT_NAVIGATION_ACTIVE = 'navigation:active';

export const EVENT_RENDER_BEGIN = 'render:begin';

export const EVENT_RENDER_END = 'render:end';

export const EVENT_ROW = 'row';

export const EVENT_SELECTION_ADD = 'selection:add';

export const EVENT_SELECTION_CLEAR = 'selection:clear';

export const EVENT_SELECTION_REMOVE = 'selection:remove';

export const EVENT_SELECTION_TOGGLE = 'selection:toggle';

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
	EVENT_FILTER_ADD,
	EVENT_FILTER_CLEAR,
	EVENT_FILTER_REMOVE,
	EVENT_FILTER_SET,
	EVENT_GROUP_ADD,
	EVENT_GROUP_CLEAR,
	EVENT_GROUP_REMOVE,
	EVENT_GROUP_TOGGLE,
	EVENT_GROUP_UPDATE,
	EVENT_NAVIGATION_ACTIVE,
	EVENT_RENDER_BEGIN,
	EVENT_RENDER_END,
	EVENT_SELECTION_ADD,
	EVENT_SELECTION_CLEAR,
	EVENT_SELECTION_REMOVE,
	EVENT_SELECTION_TOGGLE,
	EVENT_SORT_ADD,
	EVENT_SORT_CLEAR,
	EVENT_SORT_FLIP,
	EVENT_SORT_REMOVE,
	EVENT_SORT_SET,
] as const) satisfies ReadonlySet<EventName>;

export type EventMap = {
	[EVENT_DATA_ADD]: EventDataAdd;
	[EVENT_DATA_CLEAR]: EventDataClear;
	[EVENT_DATA_FILTERED]: EventDataFiltered;
	[EVENT_DATA_REMOVE]: EventDataRemove;
	[EVENT_DATA_SORTED]: EventDataSorted;
	[EVENT_DATA_SYNCHRONIZE]: EventDataSynchronize;
	[EVENT_DATA_UPDATE]: EventDataUpdate;
	[EVENT_FILTER_ADD]: EventFilterAdd;
	[EVENT_FILTER_CLEAR]: EventFilterClear;
	[EVENT_FILTER_REMOVE]: EventFilterRemove;
	[EVENT_FILTER_SET]: EventFilterSet;
	[EVENT_GROUP_ADD]: EventGroupAdd;
	[EVENT_GROUP_CLEAR]: EventGroupClear;
	[EVENT_GROUP_REMOVE]: EventGroupRemove;
	[EVENT_GROUP_TOGGLE]: EventGroupToggle;
	[EVENT_GROUP_UPDATE]: EventGroupUpdate;
	[EVENT_NAVIGATION_ACTIVE]: EventNavigationActive;
	[EVENT_RENDER_BEGIN]: EventRenderBegin;
	[EVENT_RENDER_END]: EventRenderEnd;
	[EVENT_SELECTION_ADD]: EventSelectionAdd;
	[EVENT_SELECTION_CLEAR]: EventSelectionClear;
	[EVENT_SELECTION_REMOVE]: EventSelectionRemove;
	[EVENT_SELECTION_TOGGLE]: EventSelectionToggle;
	[EVENT_SORT_ADD]: EventSortAdd;
	[EVENT_SORT_CLEAR]: EventSortClear;
	[EVENT_SORT_FLIP]: EventSortFlip;
	[EVENT_SORT_REMOVE]: EventSortRemove;
	[EVENT_SORT_SET]: EventSortSet;
};
