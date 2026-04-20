import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ZodType } from "zod";

export function useFilter<Schema extends ZodType<Record<string, unknown>>>(
	schema: Schema,
) {
	type Filter = Schema["_output"];

	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const filter: Filter = schema.parse(search);

	const getFilterSearch = (value: Filter) => {
		return (prev: Record<string, unknown>): never => {
			return {
				...prev,
				...value,
				page: 1,
			} as never; // necessary for react-router (agnostic)
		};
	};

	const handleFilter = (value: Filter) => {
		navigate({
			search: getFilterSearch(value),
		});
	};

	return { filter, getFilterSearch, handleFilter };
}
