import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ZodType } from "zod";

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	return Object.getPrototypeOf(value) === Object.prototype;
}

function isEqualValue(left: unknown, right: unknown): boolean {
	if (Object.is(left, right)) {
		return true;
	}

	if (Array.isArray(left) && Array.isArray(right)) {
		if (left.length !== right.length) {
			return false;
		}

		return left.every((value, index) => isEqualValue(value, right[index]));
	}

	if (isPlainObject(left) && isPlainObject(right)) {
		const leftKeys = Object.keys(left);
		const rightKeys = Object.keys(right);

		if (leftKeys.length !== rightKeys.length) {
			return false;
		}

		return leftKeys.every((key) => isEqualValue(left[key], right[key]));
	}

	return false;
}

export function hasNonDefaultFilterValue<
	Filter extends Record<string, unknown>,
	Key extends keyof Filter,
>(filter: Filter, defaultFilter: Filter, keys?: Key[]): boolean {
	const targetKeys = keys ?? (Object.keys(filter) as Key[]);

	return targetKeys.some(
		(key) => !isEqualValue(filter[key], defaultFilter[key]),
	);
}

export function getFilterSearchUpdater<Filter extends Record<string, unknown>>(
	value: Filter,
) {
	return (prev: Record<string, unknown>): never => {
		return {
			...prev,
			...value,
			page: 1,
		} as never; // necessary for react-router (agnostic)
	};
}

export function useFilter<Schema extends ZodType<Record<string, unknown>>>(
	schema: Schema,
) {
	type Filter = Schema["_output"];

	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const filter: Filter = schema.parse(search);
	const defaultFilter: Filter = schema.parse({});
	const getFilterSearch = (value: Filter) => getFilterSearchUpdater(value);

	const handleFilter = (value: Filter) => {
		navigate({
			search: getFilterSearch(value),
		});
	};

	const handleResetFilter = () => {
		navigate({
			search: getFilterSearch(defaultFilter),
		});
	};

	const hasNonDefaultFilter = (keys?: (keyof Filter)[]) => {
		return hasNonDefaultFilterValue(filter, defaultFilter, keys);
	};

	return {
		filter,
		defaultFilter,
		getFilterSearch,
		handleFilter,
		handleResetFilter,
		hasNonDefaultFilter,
	};
}
