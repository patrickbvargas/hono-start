import { useDebouncedCallback } from "use-debounce";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import { type ExpenseFilter, expenseFilterSchema } from "../schemas/filter";

const DEBOUNCED_FIELDS = new Set<keyof ExpenseFilter>(["query"]);

export function useExpenseFilter() {
	const {
		filter,
		defaultFilter,
		handleFilter,
		handleResetFilter,
		canClearFilters,
		hasNonDefaultFilter,
	} = useFilter(expenseFilterSchema);

	const debounceSubmit = useDebouncedCallback(
		(submit: () => void | Promise<void>) => submit(),
		300,
	);

	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => {
			const payload = expenseFilterSchema.parse(value);
			handleFilter(payload);
		},
		listeners: {
			onChange: ({ formApi, fieldApi }) => {
				if (DEBOUNCED_FIELDS.has(fieldApi.name)) {
					debounceSubmit(formApi.handleSubmit);
					return;
				}

				debounceSubmit.cancel();
				formApi.handleSubmit();
			},
			onBlur: ({ fieldApi }) => {
				if (DEBOUNCED_FIELDS.has(fieldApi.name)) {
					debounceSubmit.flush();
				}
			},
		},
	});

	const handleApplyFilter = (value: ExpenseFilter) => {
		debounceSubmit.cancel();
		form.reset(value);
		handleFilter(value);
	};

	const handleClearFilters = () => {
		debounceSubmit.cancel();
		form.reset(defaultFilter);
		handleResetFilter();
	};

	return {
		filter,
		defaultFilter,
		form,
		hasNonDefaultFilter,
		canClearFilters: canClearFilters(),
		handleApplyFilter,
		handleClearFilters,
	};
}
