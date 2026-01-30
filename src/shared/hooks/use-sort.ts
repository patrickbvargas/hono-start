import { useNavigate, useSearch } from "@tanstack/react-router";
import { type SortOrder, sortSchema } from "@/shared/schemas/sort";

export function useSort() {
	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const { sortBy, sortOrder } = sortSchema.parse(search);

	const toggleDirection = (column: string): SortOrder => {
		return column === sortBy && sortOrder === "asc" ? "desc" : "asc";
	};

	const getSortSearch = (column: string) => {
		return (prev: Record<string, unknown>): never => {
			return {
				...prev,
				sortBy: column,
				sortOrder: toggleDirection(column),
				page: 1,
			} as never; // neecessary for react-router (agnostic)
		};
	};

	const handleSort = (column: string) => {
		navigate({
			search: getSortSearch(column),
		});
	};

	return { sortBy, sortOrder, getSortSearch, handleSort };
}
