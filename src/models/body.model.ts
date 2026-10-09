// #region Types

export type BodyComponent = {
	elements: BodyElements;
	destroy(): void;
};

type BodyElements = {
	faker: HTMLDivElement;
	group: HTMLDivElement;
};

// #endregion
