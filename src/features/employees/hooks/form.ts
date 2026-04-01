import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { createEmployeeOptions } from "../api/create";
import { updateEmployeeOptions } from "../api/update";
import type { EmployeeCreate, EmployeeUpdate } from "../schemas/form";
import { employeeCreateSchema, employeeUpdateSchema } from "../schemas/form";
import { defaultFormCreateValues } from "../utils/default";

interface UseEmployeeFormOptions {
	mode: "create" | "edit";
	initialData?: EmployeeUpdate;
	onSuccess?: () => void;
}

// TODO: refatorar
export function useEmployeeForm({
	mode,
	initialData,
	onSuccess,
}: UseEmployeeFormOptions) {
	const createMutation = useMutation(createEmployeeOptions());
	const updateMutation = useMutation(updateEmployeeOptions());

	const form = useAppForm({
		defaultValues: initialData ?? defaultFormCreateValues(),
		validators: {
			onSubmit: mode === "create" ? employeeCreateSchema : employeeUpdateSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "create") {
				await createMutation.mutateAsync(
					{
						data: value as EmployeeCreate,
					},
					{
						onSuccess,
					},
				);
			} else {
				await updateMutation.mutateAsync(
					{
						data: value as EmployeeUpdate,
					},
					{
						onSuccess,
					},
				);
			}
		},
	});

	return {
		form,
		mutation: mode === "create" ? createMutation : updateMutation,
		Form: form.Form,
		Field: form.AppField,
		Submit: form.Submit,
		Reset: form.Reset,
	};
}
