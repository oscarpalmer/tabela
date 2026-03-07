export type RenderElementPool = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

export type RenderRange = {
	end: number;
	start: number;
};

export type RenderState = {
	active: boolean;
	top: number;
};
