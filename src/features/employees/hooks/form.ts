import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { createEmployeeOptions } from "../api/create";
import { updateEmployeeOptions } from "../api/update";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { EmployeeCreate, EmployeeUpdate } from "../schemas/form";
import { employeeCreateSchema, employeeUpdateSchema } from "../schemas/form";
import { defaultFormCreateValues } from "../utils/default";

interface UseEmployeeFormOptions {
	initialData?: EmployeeUpdate;
	onSuccess?: () => void;
}

export function useEmployeeForm({
	initialData,
	onSuccess,
}: UseEmployeeFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createEmployeeOptions());
	const updateMutation = useMutation(updateEmployeeOptions());

	const isEditing = !!initialData;

	const form = useAppForm({
		defaultValues: initialData ?? defaultFormCreateValues(),
		validators: {
			onSubmit: isEditing ? employeeUpdateSchema : employeeCreateSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					await updateMutation.mutateAsync({ data: value as EmployeeUpdate });
					toast.success("Funcionário atualizado com sucesso.");
				} else {
					await createMutation.mutateAsync({ data: value as EmployeeCreate });
					toast.success("Funcionário criado com sucesso.");
				}
				queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DATA_CACHE_KEY] });
				onSuccess?.();
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Ocorreu um erro inesperado";
				toast.danger(message);
			}
		},
	});

	return {
		form,
		mutation: isEditing ? updateMutation : createMutation,
		Form: form.Form,
		FormField: form.AppField,
		FormSubmit: form.Submit,
		FormReset: form.Reset,
	};
}
