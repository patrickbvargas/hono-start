import "@tanstack/react-table";

declare module "@tanstack/react-table" {
	// biome-ignore lint/correctness/noUnusedVariables: TData e TValue são necessários para o merge da interface
	interface ColumnMeta<TData, TValue> {
		headerClassName?: string;
		cellClassName?: string;
		minColumnWidth?: number;
	}
}
