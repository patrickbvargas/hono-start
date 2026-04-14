import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { updateRemunerationOptions } from "../api/update";
import { REMUNERATION_DATA_CACHE_KEY } from "../constants";
import {
	type RemunerationUpdateInput,
	remunerationUpdateInputSchema,
} from "../schemas/form";

interface UseRemunerationFormOptions {
	initialData: RemunerationUpdateInput;
	onSuccess?: () => void;
}

export function useRemunerationForm({
	initialData,
	onSuccess,
}: UseRemunerationFormOptions) {
	const queryClient = useQueryClient();
	const updateMutation = useMutation(updateRemunerationOptions());

	const form = useAppForm({
		defaultValues: initialData,
		validators: {
			onSubmit: remunerationUpdateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = remunerationUpdateInputSchema.parse(value);
				await updateMutation.mutateAsync({ data: parsed });
				toast.success("Remuneração atualizada com sucesso.");
				await refreshEntityQueries(queryClient, REMUNERATION_DATA_CACHE_KEY);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
