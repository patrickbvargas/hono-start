import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ZodType } from "zod";

interface FilterSchemas<
	Input extends ZodType<Record<string, unknown>>,
	Output extends ZodType<Record<string, unknown>>,
> {
	inputSchema: Input;
	outputSchema: Output;
}

export function useFilter<
	Input extends ZodType<Record<string, unknown>>,
	Output extends ZodType<Record<string, unknown>>,
>({ inputSchema, outputSchema }: FilterSchemas<Input, Output>) {
	type InputFilter = Input["_output"];
	type OutputFilter = Output["_output"];

	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const inputFilter: InputFilter = inputSchema.parse(search);
	const outputFilter: OutputFilter = outputSchema.parse(inputFilter);

	const getFilterSearch = (value: OutputFilter) => {
		return (prev: Record<string, unknown>): never => {
			return { ...prev, ...value, page: 1 } as never;
		};
	};

	const handleFilter = (value: OutputFilter) => {
		navigate({ search: getFilterSearch(value) });
	};

	return { inputFilter, outputFilter, getFilterSearch, handleFilter };
}
