import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const employeeDetailSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	email: z.string(),
	oabNumber: z.string().nullable(),
	remunerationPercent: z.number(),
	referrerPercent: z.number(),
	typeId: z.number(),
	roleId: z.number(),
	type: z.string(),
	typeValue: z.string(),
	role: z.string(),
	roleValue: z.string(),
	contractCount: z.number(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export const employeeSummarySchema = employeeDetailSchema.pick({
	id: true,
	fullName: true,
	oabNumber: true,
	remunerationPercent: true,
	type: true,
	role: true,
	contractCount: true,
	isActive: true,
	isSoftDeleted: true,
});

export type EmployeeDetail = z.infer<typeof employeeDetailSchema>;
export type EmployeeSummary = z.infer<typeof employeeSummarySchema>;
