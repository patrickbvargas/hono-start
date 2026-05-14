import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createClientMutationOptions,
	updateClientMutationOptions,
} from "../api/mutations";
import { clientKeys } from "../api/queries";
import {
	clientCreateInputSchema,
	clientUpdateInputSchema,
} from "../schemas/form";
import type { ClientDetail } from "../schemas/model";
import {
	defaultClientCreateValues,
	defaultClientUpdateValues,
} from "../utils/default";

interface UseClientFormOptions {
	id?: EntityId;
	initialValue?: ClientDetail;
	onSuccess?: () => void;
}

export function useClientForm({
	id,
	initialValue,
	onSuccess,
}: UseClientFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createClientMutationOptions());
	const updateMutation = useMutation(updateClientMutationOptions());

	const isEditing = !!id;
	const defaultValues =
		isEditing && initialValue
			? defaultClientUpdateValues(initialValue)
			: defaultClientCreateValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: isEditing ? clientUpdateInputSchema : clientCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = clientUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Cliente atualizado com sucesso.");
				} else {
					const parsed = clientCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Cliente criado com sucesso.");
				}
				await refreshAuditedEntityQueries(queryClient, clientKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	React.useEffect(() => {
		if (isEditing && initialValue) {
			form.reset(defaultClientUpdateValues(initialValue));
		}
	}, [form, initialValue, isEditing]);

	return { form };
}
