import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const remunerationSchema = entityIdSchema.safeExtend({
	contractEmployeeId: z.number(),
	employeeId: z.number(),
	employeeName: z.string(),
	client: z.string(),
	contractId: z.number(),
	contractProcessNumber: z.string(),
	feeId: z.number(),
	feeAmount: z.number(),
	feeInstallmentNumber: z.number().int(),
	paymentDate: z.iso.datetime(),
	amount: z.number(),
	effectivePercentage: z.number(),
	isManualOverride: z.boolean(),
	isSystemGenerated: z.boolean(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	parentFeeIsSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type Remuneration = z.infer<typeof remunerationSchema>;
