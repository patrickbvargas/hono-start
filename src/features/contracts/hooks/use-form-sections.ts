import { useStore } from "@tanstack/react-form-start";
import { useEffect, useId, useRef, useState } from "react";
import {
	type ContractRevenueInput,
	contractCreateInputSchema,
	contractRevenueInputSchema,
} from "../schemas/form";
import type { useContractForm } from "./use-form";

interface UseFormSectionsOptions {
	form: ReturnType<typeof useContractForm>["form"];
}

export function useContractFormSections({ form }: UseFormSectionsOptions) {
	const namespace = useId();
	const keys = useRef<Record<"assignments" | "revenues", string[]>>({
		assignments: [],
		revenues: [],
	});
	const nextKey = useRef(0);
	const [focusKey, setFocusKey] = useState<string | null>(null);
	const [values, submissionAttempts] = useStore(form.store, (state) => [
		state.values,
		state.submissionAttempts,
	]);
	const validation =
		submissionAttempts > 0 ? contractCreateInputSchema.safeParse(values) : null;

	function getRowKey(section: "assignments" | "revenues", index: number) {
		if (!keys.current[section][index]) {
			nextKey.current += 1;
			keys.current[section][index] =
				`${namespace}-${section}-${nextKey.current}`;
		}
		return keys.current[section][index];
	}
	function focusAddedRow(section: "assignments" | "revenues", index: number) {
		setFocusKey(getRowKey(section, index));
	}
	function removeRowKey(section: "assignments" | "revenues", index: number) {
		keys.current[section].splice(index, 1);
	}
	function isRevenueRequiredOpen(revenue: ContractRevenueInput, index: number) {
		if (
			!contractRevenueInputSchema.safeParse(revenue).success ||
			(revenue.downPaymentValue ?? 0) > revenue.totalValue
		) {
			return true;
		}
		return (
			validation?.success === false &&
			validation.error.issues.some(
				(issue) =>
					issue.path[0] === "revenues" &&
					(issue.path.length === 1 || issue.path[1] === index),
			)
		);
	}
	useEffect(() => {
		if (!focusKey) {
			return;
		}
		const frame = requestAnimationFrame(() => {
			const row = document.querySelector<HTMLElement>(
				`[data-contract-row="${focusKey}"]`,
			);
			const input = row?.querySelector<HTMLElement>(
				'input:not([type="hidden"]):not([disabled]), button:not([disabled])',
			);
			input?.focus();
			input?.scrollIntoView?.({ block: "nearest" });
			setFocusKey(null);
		});
		return () => cancelAnimationFrame(frame);
	}, [focusKey]);
	return {
		getRowKey,
		focusAddedRow,
		removeRowKey,
		isRevenueRequiredOpen,
		submissionAttempts,
	};
}
