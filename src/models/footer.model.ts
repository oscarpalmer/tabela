// #region Types

export type FooterComponent = {
	elements: FooterElements;
	hidden: boolean;
	destroy(): void;
};

type FooterElements = {
	cells: HTMLDivElement[];
	group: HTMLDivElement;
	row: HTMLDivElement;
};

// #endregion
