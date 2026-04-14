import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const contractAssignmentSchema = entityIdSchema.safeExtend({
	employeeId: z.number(),
	employeeName: z.string(),
	employeeType: z.string(),
	employeeTypeValue: z.string(),
	assignmentType: z.string(),
	assignmentTypeValue: z.string(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
});

export const contractRevenueSchema = entityIdSchema.safeExtend({
	typeId: z.number(),
	type: z.string(),
	typeValue: z.string(),
	totalValue: z.number(),
	downPaymentValue: z.number().nullable(),
	paymentStartDate: z.iso.datetime(),
	totalInstallments: z.number(),
	paidValue: z.number(),
	installmentsPaid: z.number().int().nonnegative(),
	remainingValue: z.number(),
	isFullyPaid: z.boolean(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
});

export const contractSchema = entityIdSchema.safeExtend({
	processNumber: z.string(),
	clientId: z.number(),
	client: z.string(),
	legalAreaId: z.number(),
	legalArea: z.string(),
	legalAreaValue: z.string(),
	statusId: z.number(),
	status: z.string(),
	statusValue: z.string(),
	feePercentage: z.number(),
	notes: z.string().nullable(),
	allowStatusChange: z.boolean(),
	assignments: z.array(contractAssignmentSchema),
	revenues: z.array(contractRevenueSchema),
	assignmentCount: z.number(),
	revenueCount: z.number(),
	assignedEmployeeIds: z.array(z.number()),
	isAssignedToActor: z.boolean(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type ContractAssignment = z.infer<typeof contractAssignmentSchema>;
export type ContractRevenue = z.infer<typeof contractRevenueSchema>;
export type Contract = z.infer<typeof contractSchema>;
