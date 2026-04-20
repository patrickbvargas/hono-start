import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const clientDetailSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	document: z.string(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	typeId: z.number(),
	typeValue: z.string(),
	type: z.string(),
	contractCount: z.number(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export const clientSummarySchema = clientDetailSchema.pick({
	id: true,
	fullName: true,
	document: true,
	type: true,
	contractCount: true,
	isActive: true,
	isSoftDeleted: true,
});

export type ClientDetail = z.infer<typeof clientDetailSchema>;
export type ClientSummary = z.infer<typeof clientSummarySchema>;
