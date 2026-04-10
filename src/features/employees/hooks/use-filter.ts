import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import { employeeFilterSchema } from "../schemas/filter";

export function useEmployeeFilter() {
	const { filter, handleFilter } = useFilter(employeeFilterSchema);

	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => {
			const payload = employeeFilterSchema.parse(value);
			handleFilter(payload);
		},
		listeners: {
			onChange: ({ formApi }) => {
				formApi.handleSubmit();
			},
			onChangeDebounceMs: 500,
		},
	});

	return { form };
}
