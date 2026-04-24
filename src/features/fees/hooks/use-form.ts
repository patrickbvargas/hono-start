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
	createFeeMutationOptions,
	updateFeeMutationOptions,
} from "../api/mutations";
import { feeKeys, getFeeByIdQueryOptions } from "../api/queries";
import { feeCreateInputSchema, feeUpdateInputSchema } from "../schemas/form";
import {
	defaultFeeCreateValues,
	defaultFeeUpdateValues,
} from "../utils/default";

interface UseFeeFormOptions {
	id?: EntityId;
	onSuccess?: () => void;
}

export function useFeeForm({ id, onSuccess }: UseFeeFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createFeeMutationOptions());
	const updateMutation = useMutation(updateFeeMutationOptions());

	const isEditing = !!id;
	const { data } = useQuery({
		...getFeeByIdQueryOptions(id ?? 0),
		enabled: isEditing,
	});

	const form = useAppForm({
		defaultValues: defaultFeeCreateValues(),
		validators: {
			onSubmit: isEditing ? feeUpdateInputSchema : feeCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = feeUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Honorário atualizado com sucesso.");
				} else {
					const parsed = feeCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Honorário criado com sucesso.");
				}

				await refreshEntityQueries(queryClient, feeKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	React.useEffect(() => {
		if (isEditing && data) {
			form.reset(defaultFeeUpdateValues(data));
		}
	}, [data, form, isEditing]);

	return { form };
}
