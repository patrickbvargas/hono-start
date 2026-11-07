import {
	useQueryErrorResetBoundary,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { getSettlementOptionsQueryOptions } from "../api/queries";
import type { SettlementTargetInput } from "../schemas/form";

export function useSettlementOptions(target: SettlementTargetInput) {
	const { data } = useSuspenseQuery(getSettlementOptionsQueryOptions(target));
	return { methods: data.methods };
}

export function useSettlementOptionsRecovery() {
	const { reset } = useQueryErrorResetBoundary();
	return { resetOptionsError: reset };
}
