import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import {
	createSettlementMutationOptions,
	reverseSettlementMutationOptions,
} from "../api/mutations";
import {
	type SettlementTargetInput,
	settlementCreateInputSchema,
	settlementReverseInputSchema,
} from "../schemas/form";
import { getSettlementToday } from "../utils/date";
import { refreshSettlementQueries } from "../utils/refresh";

interface UseSettlementFormOptions {
	target: SettlementTargetInput;
	balance: number;
	method: string;
	isContract: boolean;
	onSuccess: () => void;
}
export function useSettlementForm({
	target,
	balance,
	method,
	isContract,
	onSuccess,
}: UseSettlementFormOptions) {
	const client = useQueryClient();
	const mutation = useMutation(createSettlementMutationOptions());
	const [requestKey] = useState<string>(() => crypto.randomUUID());
	const form = useAppForm({
		defaultValues: {
			...target,
			requestKey,
			effectiveDate: getSettlementToday(),
			actualPaymentMethod: method,
			principalAbated: balance,
			discount: 0,
			interest: 0,
			penalty: 0,
			generatesRemuneration: target.direction === "receivable" && isContract,
		},
		validators: { onSubmit: settlementCreateInputSchema },
		onSubmitInvalid: () => toast.danger("Revise os campos da baixa."),
		onSubmit: async ({ value }) => {
			try {
				await mutation.mutateAsync({
					data: settlementCreateInputSchema.parse(value),
				});
				await refreshSettlementQueries(client);
				toast.success("Baixa registrada com sucesso.");
				onSuccess();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});
	return { form };
}

interface UseReversalFormOptions {
	target: SettlementTargetInput;
	movementId: number;
	onSuccess: () => void;
}
export function useReversalForm({
	target,
	movementId,
	onSuccess,
}: UseReversalFormOptions) {
	const client = useQueryClient();
	const mutation = useMutation(reverseSettlementMutationOptions());
	const [requestKey] = useState<string>(() => crypto.randomUUID());
	const form = useAppForm({
		defaultValues: {
			...target,
			movementId,
			requestKey,
			effectiveDate: getSettlementToday(),
			reason: "",
		},
		validators: { onSubmit: settlementReverseInputSchema },
		onSubmitInvalid: () => toast.danger("Informe data e motivo do estorno."),
		onSubmit: async ({ value }) => {
			try {
				await mutation.mutateAsync({
					data: settlementReverseInputSchema.parse(value),
				});
				await refreshSettlementQueries(client);
				toast.success("Estorno registrado com sucesso.");
				onSuccess();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});
	return { form };
}
