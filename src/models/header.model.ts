// #region Types

export type HeaderComponent = {
	elements: HeaderElements;
	destroy(): void;
};

type HeaderElements = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

// #endregion
