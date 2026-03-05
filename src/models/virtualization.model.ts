export type VirtualizationPool = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

export type VirtualizationRange = {
	end: number;
	start: number;
};

export type VirtualizationState = {
	active: boolean;
	top: number;
};
