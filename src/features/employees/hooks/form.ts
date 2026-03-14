import { useAppForm } from "@/shared/hooks/use-app-form";
import { employeeCreateSchema } from "../schemas/form";
import { getDefaultFormCreateValues } from "../utils/default";

export function useEmployeeForm() {
	const form = useAppForm({
		defaultValues: getDefaultFormCreateValues(),
		validators: { onSubmit: employeeCreateSchema },
		onSubmit: ({ value }) => {
			alert(JSON.stringify(employeeCreateSchema.parse(value), null, 2));
		},
	});

	return {
		form,
		Form: form.Form,
		Field: form.AppField,
		Submit: form.Submit,
		Reset: form.Reset,
	};
}
