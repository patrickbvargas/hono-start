import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const feeDetailSchema = entityIdSchema.safeExtend({
	contractId: z.number(),
	contractProcessNumber: z.string(),
	client: z.string(),
	clientId: z.number().int().positive(),
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

export const feeSummarySchema = feeDetailSchema;

export type FeeDetail = z.infer<typeof feeDetailSchema>;
export type FeeSummary = z.infer<typeof feeSummarySchema>;
export const feeRevenueOptionSchema = z.object({
	id: z.number(),
	value: z.string(),
	label: z.string(),
	isDisabled: z.boolean(),
	totalInstallments: z.number().int().positive(),
	nextInstallmentNumber: z.number().int().positive(),
});
export type FeeRevenueOption = z.infer<typeof feeRevenueOptionSchema>;
