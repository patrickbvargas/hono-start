import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useRef } from "react";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import {
	generatePayablesFromExpenseMutationOptions,
	generateReceivablesFromRevenueMutationOptions,
} from "../api/mutations";
import { financialTitleKeys } from "../api/queries";
import {
	expensePayableGenerationInputSchema,
	revenueReceivableGenerationInputSchema,
	revenueTitleScheduleInputSchema,
	type TitleInput,
	titlePlanInputSchema,
} from "../schemas/form";
import { buildRevenueTitlePlan } from "../utils/payment-plan";

interface UseRevenueTitleFormOptions {
	revenueId: number;
	negotiatedAmount: number;
	onSuccess?: () => void | Promise<void>;
}

export function useRevenueTitleForm({
	revenueId,
	negotiatedAmount,
	onSuccess,
}: UseRevenueTitleFormOptions) {
	return useTitleGenerationForm({
		source: { kind: "revenue", id: revenueId },
		negotiatedAmount,
		onSuccess,
	});
}

interface UseTitleGenerationFormOptions {
	source: { kind: "revenue" | "expense"; id: number };
	negotiatedAmount: number;
	onSuccess?: () => void | Promise<void>;
}

export function useTitleGenerationForm({
	source,
	negotiatedAmount,
	onSuccess,
}: UseTitleGenerationFormOptions) {
	const client = useQueryClient();
	const namespace = useId();
	const rowKeys = useRef<string[]>([]);
	const nextKey = useRef(0);
	const revenueMutation = useMutation(
		generateReceivablesFromRevenueMutationOptions(),
	);
	const expenseMutation = useMutation(
		generatePayablesFromExpenseMutationOptions(),
	);
	const form = useAppForm({
		defaultValues: {
			negotiatedAmount,
			downPaymentAmount: 0,
			downPaymentDueDate: "",
			installmentCount: 1,
			firstDueDate: "",
			analytic: "",
			expectedPaymentMethod: "",
			titles: [] as TitleInput[],
		},
		validators: { onSubmit: titlePlanInputSchema },
		listeners: {
			onChange: ({ formApi, fieldApi }) => {
				if (fieldApi.name === "titles" || fieldApi.name.startsWith("titles[")) {
					return;
				}
				const parsed = revenueTitleScheduleInputSchema.safeParse(
					formApi.state.values,
				);
				rowKeys.current = [];
				formApi.setFieldValue(
					"titles",
					parsed.success ? buildRevenueTitlePlan(parsed.data) : [],
				);
			},
		},
		onSubmitInvalid: () => {
			toast.danger("Revise a prévia e os campos obrigatórios.");
		},
		onSubmit: async ({ value }) => {
			try {
				if (source.kind === "expense") {
					const parsed = expensePayableGenerationInputSchema.parse({
						expenseId: source.id,
						titles: value.titles,
					});
					await expenseMutation.mutateAsync({ data: parsed });
				} else {
					const parsed = revenueReceivableGenerationInputSchema.parse({
						revenueId: source.id,
						titles: value.titles,
					});
					await revenueMutation.mutateAsync({ data: parsed });
				}
				await refreshAuditedEntityQueries(client, financialTitleKeys.all);
				await onSuccess?.();
				toast.success("Parcelas geradas com sucesso.");
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});
	function getRowKey(index: number) {
		if (!rowKeys.current[index]) {
			rowKeys.current[index] = `${namespace}-${++nextKey.current}`;
		}
		return rowKeys.current[index];
	}
	function addTitle() {
		const values = form.state.values;
		form.pushFieldValue("titles", {
			amount: 0,
			dueDate: values.firstDueDate,
			kind: "EXTRA",
			analytic: values.analytic,
			expectedPaymentMethod: values.expectedPaymentMethod,
			notes: "",
		});
	}
	function removeTitle(index: number) {
		rowKeys.current.splice(index, 1);
		form.removeFieldValue("titles", index);
	}
	return { form, getRowKey, addTitle, removeTitle };
}
