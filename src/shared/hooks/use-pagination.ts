import { useNavigate, useSearch } from "@tanstack/react-router";
import { paginationSchema } from "@/shared/schemas/pagination";

export function usePagination() {
	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const { page, limit } = paginationSchema.parse(search);

	const getPaginationSearch = (page: number) => {
		return (prev: Record<string, unknown>): never => {
			return {
				...prev,
				page,
				limit,
			} as never; // necessary for react-router (agnostic)
		};
	};

	const handlePagination = (page: number) => {
		navigate({
			search: getPaginationSearch(page),
		});
	};

	return { page, limit, getPaginationSearch, handlePagination };
}
