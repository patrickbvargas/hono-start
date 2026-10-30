import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createPersonMutationOptions,
	updatePersonMutationOptions,
} from "../api/mutations";
import { personKeys } from "../api/queries";
import {
	personCreateInputSchema,
	personUpdateInputSchema,
} from "../schemas/form";
import type { PersonDetail } from "../schemas/model";
import {
	defaultPersonCreateValues,
	defaultPersonUpdateValues,
} from "../utils/default";

interface UsePersonFormOptions {
	id?: EntityId;
	initialValue?: PersonDetail;
	onSuccess?: () => void;
}

export function usePersonForm({
	id,
	initialValue,
	onSuccess,
}: UsePersonFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createPersonMutationOptions());
	const updateMutation = useMutation(updatePersonMutationOptions());

	const isEditing = !!id;
	const defaultValues =
		isEditing && initialValue
			? defaultPersonUpdateValues(initialValue)
			: defaultPersonCreateValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: isEditing ? personUpdateInputSchema : personCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = personUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Pessoa atualizada com sucesso.");
				} else {
					const parsed = personCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Pessoa criada com sucesso.");
				}
				await refreshAuditedEntityQueries(queryClient, personKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
