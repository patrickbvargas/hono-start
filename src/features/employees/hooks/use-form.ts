import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { employeeKeys } from "../api/queries";
import {
	employeeCreateInputSchema,
	employeeUpdateInputSchema,
} from "../schemas/form";
import type { EmployeeDetail } from "../schemas/model";
import {
	defaultEmployeeCreateValues,
	defaultEmployeeUpdateValues,
} from "../utils/default";

interface UseEmployeeFormOptions {
	id?: EntityId;
	initialValue?: EmployeeDetail;
	onSuccess?: () => void;
}

export function useEmployeeForm({
	id,
	initialValue,
	onSuccess,
}: UseEmployeeFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createEmployeeMutationOptions());
	const updateMutation = useMutation(updateEmployeeMutationOptions());

	const isEditing = !!id;
	const defaultValues =
		isEditing && initialValue
			? defaultEmployeeUpdateValues(initialValue)
			: defaultEmployeeCreateValues();

	const form = useAppForm({
		defaultValues,
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
					toast.success("Colaborador atualizado com sucesso.");
				} else {
					const parsed = employeeCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Colaborador criado com sucesso.");
				}
				await refreshEntityQueries(queryClient, employeeKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	React.useEffect(() => {
		if (isEditing && initialValue) {
			form.reset(defaultEmployeeUpdateValues(initialValue));
		}
	}, [form, initialValue, isEditing]);

	return { form };
}
