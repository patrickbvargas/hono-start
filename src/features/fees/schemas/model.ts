import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const feeSchema = entityIdSchema.safeExtend({
	contractId: z.number(),
	contractProcessNumber: z.string(),
	client: z.string(),
	contractStatusValue: z.string(),
	revenueId: z.number(),
	revenueType: z.string(),
	revenueTypeValue: z.string(),
	paymentDate: z.iso.datetime(),
	amount: z.number(),
	installmentNumber: z.number().int(),
	generatesRemuneration: z.boolean(),
	remunerationCount: z.number().int().nonnegative(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type Fee = z.infer<typeof feeSchema>;
