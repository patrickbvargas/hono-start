import { useDebouncedCallback } from "use-debounce";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import { type EmployeeFilter, employeeFilterSchema } from "../schemas/filter";

const DEBOUNCED_FIELDS = new Set<keyof EmployeeFilter>(["query"]);

export function useEmployeeFilter() {
	const { filter, handleFilter } = useFilter(employeeFilterSchema);

	const debounceSubmit = useDebouncedCallback(
		(submit: () => void | Promise<void>) => submit(),
		300,
	);

	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => {
			const payload = employeeFilterSchema.parse(value);
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

	return { form };
}
