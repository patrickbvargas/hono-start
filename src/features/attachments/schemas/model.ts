import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const attachmentSummarySchema = entityIdSchema.safeExtend({
	fileName: z.string(),
	uploadedByName: z.string().nullable(),
	fileSize: z.number().int().nonnegative(),
	mimeType: z.string(),
	typeId: z.number(),
	type: z.string(),
	typeValue: z.string(),
	downloadUrl: z.url().nullable(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export type AttachmentSummary = z.infer<typeof attachmentSummarySchema>;
