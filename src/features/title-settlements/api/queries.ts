import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/shared/session/server";
import { getSettlementOptions } from "../data/queries";
import {
	type SettlementTargetInput,
	settlementTargetInputSchema,
} from "../schemas/form";
import { settlementOptionsSchema } from "../schemas/model";

export const settlementKeys = {
	all: ["title-settlement"] as const,
	options: (target: SettlementTargetInput) =>
		[...settlementKeys.all, "options", target] as const,
};
const getSettlementOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(settlementTargetInputSchema)
	.handler(async ({ context, data }) => {
		try {
			return await getSettlementOptions(context.session, data);
		} catch (error) {
			console.error("[getSettlementOptions]", error);
			throw new Error("Não foi possível carregar os meios de pagamento.");
		}
	});
export const getSettlementOptionsQueryOptions = (
	target: SettlementTargetInput,
) =>
	queryOptions({
		queryKey: settlementKeys.options(target),
		queryFn: async () =>
			settlementOptionsSchema.parse(
				await getSettlementOptionsFn({ data: target }),
			),
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});
