import { useSuspenseQuery } from "@tanstack/react-query";
import { getTitleGenerationOptionsQueryOptions } from "../api/queries";

export function useTitleGenerationOptions() {
	const { data } = useSuspenseQuery(getTitleGenerationOptionsQueryOptions());
	return { analytics: data.analytics, paymentMethods: data.paymentMethods };
}
