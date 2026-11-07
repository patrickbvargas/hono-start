import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { assertCan } from "@/shared/session";
import { authMiddleware } from "@/shared/session/server";
import { getTitleGenerationOptions } from "../data/queries";
import { titleGenerationOptionsInputSchema } from "../schemas/form";

export const financialTitleKeys = {
	all: ["financial-title"] as const,
	options: (direction: "receivable" | "payable" = "receivable") =>
		[...financialTitleKeys.all, "generation-options", direction] as const,
};

const getTitleGenerationOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(titleGenerationOptionsInputSchema)
	.handler(async ({ context, data }) => {
		assertCan(
			context.session,
			data.direction === "payable"
				? "org:payables:generate"
				: "org:receivables:generate",
		);
		try {
			return await getTitleGenerationOptions();
		} catch (error) {
			console.error("[getTitleGenerationOptions]", error);
			throw new Error("Não foi possível carregar as opções de geração.");
		}
	});

export const getTitleGenerationOptionsQueryOptions = (
	direction: "receivable" | "payable" = "receivable",
) =>
	queryOptions({
		queryKey: financialTitleKeys.options(direction),
		queryFn: () => getTitleGenerationOptionsFn({ data: { direction } }),
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});
