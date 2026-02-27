import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const employeeSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	oabNumber: z.string().nullable(),
	remunerationPercent: z.number(),
	type: z.string(),
	role: z.string(),
	slug: z.string(),
	status: z.string(),
	contractCount: z.number(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type Employee = z.infer<typeof employeeSchema>;
