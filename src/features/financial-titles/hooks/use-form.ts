import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useRef } from "react";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { generateReceivablesFromRevenueMutationOptions } from "../api/mutations";
import { financialTitleKeys } from "../api/queries";
import {
	revenueReceivableGenerationInputSchema,
	revenueTitlePlanInputSchema,
	revenueTitleScheduleInputSchema,
	type TitleInput,
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
	const client = useQueryClient();
	const namespace = useId();
	const rowKeys = useRef<string[]>([]);
	const nextKey = useRef(0);
	const mutation = useMutation(generateReceivablesFromRevenueMutationOptions());
	const form = useAppForm({
		defaultValues: {
			revenueId,
			negotiatedAmount,
			downPaymentAmount: 0,
			downPaymentDueDate: "",
			installmentCount: 1,
			firstDueDate: "",
			analytic: "",
			expectedPaymentMethod: "",
			titles: [] as TitleInput[],
		},
		validators: { onSubmit: revenueTitlePlanInputSchema },
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
				const parsed = revenueReceivableGenerationInputSchema.parse(value);
				await mutation.mutateAsync({ data: parsed });
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
