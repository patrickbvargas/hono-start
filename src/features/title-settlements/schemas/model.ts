import * as z from "zod";

export const settlementOptionsSchema = z.object({
	methods: z
		.object({
			value: z.string().min(1),
			label: z.string().min(1),
		})
		.array(),
});
