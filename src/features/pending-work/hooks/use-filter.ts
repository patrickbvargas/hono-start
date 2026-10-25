import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import {
	type PendingWorkFilter,
	pendingWorkFilterSchema,
} from "../schemas/filter";

export function usePendingWorkFilter() {
	const {
		filter,
		defaultFilter,
		handleFilter,
		handleResetFilter,
		canClearFilters,
	} = useFilter(pendingWorkFilterSchema);
	const debounceSubmit = useDebouncedCallback(
		(submit: () => void | Promise<void>) => submit(),
		300,
	);
	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => handleFilter(pendingWorkFilterSchema.parse(value)),
		listeners: {
			onChange: ({ formApi, fieldApi }) => {
				if (fieldApi.name === "query") {
					debounceSubmit(formApi.handleSubmit);
					return;
				}
				debounceSubmit.cancel();
				formApi.handleSubmit();
			},
			onBlur: ({ fieldApi }) => {
				if (fieldApi.name === "query") {
					debounceSubmit.flush();
				}
			},
		},
	});
	const serializedFilter = JSON.stringify(filter);
	useEffect(() => {
		form.reset(pendingWorkFilterSchema.parse(JSON.parse(serializedFilter)));
	}, [form, serializedFilter]);
	function handleApplyFilter(value: PendingWorkFilter) {
		debounceSubmit.cancel();
		form.reset(value);
		handleFilter(value);
	}
	function handleClearFilters() {
		debounceSubmit.cancel();
		form.reset(defaultFilter);
		handleResetFilter();
	}
	return {
		filter,
		defaultFilter,
		form,
		handleApplyFilter,
		handleClearFilters,
		canClearFilters: canClearFilters(),
	};
}
