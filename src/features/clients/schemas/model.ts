import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const clientSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	document: z.string(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	typeId: z.number(),
	type: z.string(),
	typeValue: z.string(),
	contractCount: z.number(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type Client = z.infer<typeof clientSchema>;
