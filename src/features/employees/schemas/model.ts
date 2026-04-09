import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const employeeSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	email: z.string(),
	oabNumber: z.string().nullable(),
	remunerationPercent: z.number(),
	referrerPercent: z.number(),
	typeId: z.number(),
	roleId: z.number(),
	type: z.string(),
	role: z.string(),
	contractCount: z.number(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type Employee = z.infer<typeof employeeSchema>;
