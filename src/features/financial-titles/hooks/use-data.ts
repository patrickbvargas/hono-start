import { useSuspenseQuery } from "@tanstack/react-query";
import { getTitleGenerationOptionsQueryOptions } from "../api/queries";

export function useTitleGenerationOptions(
	direction: "receivable" | "payable" = "receivable",
) {
	const { data } = useSuspenseQuery(
		getTitleGenerationOptionsQueryOptions(direction),
	);
	return { analytics: data.analytics, paymentMethods: data.paymentMethods };
}
