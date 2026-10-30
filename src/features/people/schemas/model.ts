import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const personDetailSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	document: z.string(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	typeId: z.number().nullable(),
	typeValue: z.string(),
	type: z.string(),
	contractCount: z.number(),
	isGeneric: z.boolean(),
	roles: z.array(z.string()),
	isCustomer: z.boolean().optional(),
	isSupplier: z.boolean().optional(),
	isEmployee: z.boolean().optional(),
	professional: z
		.object({
			type: z.string(),
			typeLabel: z.string(),
			oabNumber: z.string().nullable(),
			remunerationPercent: z.number(),
			referrerPercent: z.number(),
		})
		.optional(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export const personSummarySchema = personDetailSchema.pick({
	id: true,
	isGeneric: true,
	roles: true,
	fullName: true,
	document: true,
	type: true,
	contractCount: true,
	isActive: true,
	isSoftDeleted: true,
});

export type PersonDetail = z.infer<typeof personDetailSchema>;
export type PersonSummary = z.infer<typeof personSummarySchema>;

export const personFinanceSchema = z.object({
	contractCount: z.number().int().nonnegative(),
	totalValue: z.number(),
	paidValue: z.number(),
	remainingValue: z.number(),
	payableValue: z.number(),
	paidOutValue: z.number(),
	payableBalance: z.number(),
});
export type PersonFinance = z.infer<typeof personFinanceSchema>;
