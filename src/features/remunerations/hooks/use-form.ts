import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { updateRemunerationMutationOptions } from "../api/mutations";
import { getRemunerationByIdQueryOptions } from "../api/queries";
import { REMUNERATION_DATA_CACHE_KEY } from "../constants/cache";
import { remunerationUpdateInputSchema } from "../schemas/form";
import { defaultRemunerationUpdateValues } from "../utils/default";

interface UseRemunerationFormOptions {
	id: EntityId;
	onSuccess?: () => void;
}

export function useRemunerationForm({
	id,
	onSuccess,
}: UseRemunerationFormOptions) {
	const queryClient = useQueryClient();
	const updateMutation = useMutation(updateRemunerationMutationOptions());
	const { data } = useQuery(getRemunerationByIdQueryOptions(id));

	const form = useAppForm({
		defaultValues: {
			id,
			amount: 0,
			effectivePercentage: 0,
		},
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

	React.useEffect(() => {
		if (data) {
			form.reset(defaultRemunerationUpdateValues(data));
		}
	}, [data, form]);

	return { form };
}
