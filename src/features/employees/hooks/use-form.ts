import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createEmployeeOptions } from "../api/create";
import { updateEmployeeOptions } from "../api/update";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { EmployeeUpdate } from "../schemas/form";
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
					const parsed = employeeUpdateSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Funcionário atualizado com sucesso.");
				} else {
					const parsed = employeeCreateSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Funcionário criado com sucesso.");
				}
				await refreshEntityQueries(queryClient, EMPLOYEE_DATA_CACHE_KEY);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
