import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { assertCan } from "@/shared/session";
import { authMiddleware } from "@/shared/session/server";
import { getTitleGenerationOptions } from "../data/queries";

export const financialTitleKeys = {
	all: ["financial-title"] as const,
	options: () => [...financialTitleKeys.all, "generation-options"] as const,
};

const getTitleGenerationOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		assertCan(context.session, "org:receivables:generate");
		try {
			return await getTitleGenerationOptions();
		} catch (error) {
			console.error("[getTitleGenerationOptions]", error);
			throw new Error("Não foi possível carregar as opções de geração.");
		}
	});

export const getTitleGenerationOptionsQueryOptions = () =>
	queryOptions({
		queryKey: financialTitleKeys.options(),
		queryFn: getTitleGenerationOptionsFn,
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});
