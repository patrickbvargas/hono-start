import * as z from "zod";

export const drilldownOverviewSchema = z.array(
	z.object({
		key: z.string(),
		label: z.string(),
		groups: z.array(
			z.object({ key: z.string(), label: z.string(), amount: z.number() }),
		),
	}),
);
