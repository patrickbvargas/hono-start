import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ZodType } from "zod";

export function useFilter<TSchema extends ZodType<Record<string, unknown>>>(
	schema: TSchema,
) {
	type TFilter = TSchema["_output"];

	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const filter: TFilter = schema.parse(search);

	const getFilterSearch = (value: TFilter) => {
		return (prev: Record<string, unknown>): never => {
			return {
				...prev,
				...value,
				page: 1,
			} as never; // necessary for react-router (agnostic)
		};
	};

	const handleFilter = (value: TFilter) => {
		navigate({
			search: getFilterSearch(value),
		});
	};

	return { filter, getFilterSearch, handleFilter };
}
