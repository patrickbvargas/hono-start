import "@tanstack/react-table";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TFeatures, TData, TValue> {
		headerClassName?: string;
		cellClassName?: string;
		minColumnWidth?: number;
	}
}
