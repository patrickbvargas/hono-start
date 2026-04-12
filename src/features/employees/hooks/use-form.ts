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
import type { EmployeeRole, EmployeeType } from "../schemas/option";
import { defaultFormCreateValues } from "../utils/default";
import {
	normalizeEmployeeInput,
	validateEmployeeBusinessRules,
} from "../utils/validation";

interface UseEmployeeFormOptions {
	initialData?: EmployeeUpdate;
	onSuccess?: () => void;
	roles: EmployeeRole[];
	types: EmployeeType[];
}

export function useEmployeeForm({
	initialData,
	onSuccess,
	roles,
	types,
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
					const selectedType = types.find((type) => type.id === parsed.type);
					if (!selectedType) throw new Error("Selecione uma função válida");
					const selectedRole = roles.find((role) => role.id === parsed.role);
					if (!selectedRole) throw new Error("Selecione um perfil válido");
					const payload = normalizeEmployeeInput(parsed, selectedType.value);
					validateEmployeeBusinessRules(payload, selectedType.value);
					await updateMutation.mutateAsync({ data: payload });
					toast.success("Funcionário atualizado com sucesso.");
				} else {
					const parsed = employeeCreateSchema.parse(value);
					const selectedType = types.find((type) => type.id === parsed.type);
					if (!selectedType) throw new Error("Selecione uma função válida");
					const selectedRole = roles.find((role) => role.id === parsed.role);
					if (!selectedRole) throw new Error("Selecione um perfil válido");
					const payload = normalizeEmployeeInput(parsed, selectedType.value);
					validateEmployeeBusinessRules(payload, selectedType.value);
					await createMutation.mutateAsync({ data: payload });
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
