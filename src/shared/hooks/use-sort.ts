import { useNavigate, useSearch } from "@tanstack/react-router";
import { type SortDirection, sortSchema } from "@/shared/schemas/sort";

export function useSort() {
	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const { column, direction } = sortSchema.parse(search);

	const toggleDirection = (col: string): SortDirection => {
		return col === column && direction === "asc" ? "desc" : "asc";
	};

	const getSortSearch = (column: string) => {
		return (prev: Record<string, unknown>): never => {
			return {
				...prev,
				column: column,
				direction: toggleDirection(column),
				page: 1,
			} as never; // neecessary for react-router (agnostic)
		};
	};

	const handleSort = (column: string) => {
		navigate({
			search: getSortSearch(column),
		});
	};

	return { column, direction, getSortSearch, handleSort };
}
