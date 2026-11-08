import * as z from "zod";

export const financialDrilldownOverviewSchema = z.array(
	z.object({
		key: z.string(),
		label: z.string(),
		groups: z.array(
			z.object({ key: z.string(), label: z.string(), amount: z.number() }),
		),
	}),
);

export type FinancialDrilldownOverview = z.infer<
	typeof financialDrilldownOverviewSchema
>;
