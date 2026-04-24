import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createEmployeeMutationOptions,
	updateEmployeeMutationOptions,
} from "../api/mutations";
import { employeeKeys, getEmployeeByIdQueryOptions } from "../api/queries";
import {
	employeeCreateInputSchema,
	employeeUpdateInputSchema,
} from "../schemas/form";
import {
	defaultEmployeeCreateValues,
	defaultEmployeeUpdateValues,
} from "../utils/default";

interface UseEmployeeFormOptions {
	id?: EntityId;
	onSuccess?: () => void;
}

export function useEmployeeForm({ id, onSuccess }: UseEmployeeFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createEmployeeMutationOptions());
	const updateMutation = useMutation(updateEmployeeMutationOptions());

	const isEditing = !!id;

	const { data } = useQuery({
		...getEmployeeByIdQueryOptions(id ?? 0),
		enabled: isEditing,
	});

	const form = useAppForm({
		defaultValues: defaultEmployeeCreateValues(),
		validators: {
			onSubmit: isEditing
				? employeeUpdateInputSchema
				: employeeCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = employeeUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Funcionário atualizado com sucesso.");
				} else {
					const parsed = employeeCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Funcionário criado com sucesso.");
				}
				await refreshEntityQueries(queryClient, employeeKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	React.useEffect(() => {
		if (isEditing && data) {
			form.reset(defaultEmployeeUpdateValues(data));
		}
	}, [data, form, isEditing]);

	return { form };
}
