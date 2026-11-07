import * as z from "zod";
import { payableSearchSchema } from "./search";
export const payableWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "payments", "attachments", "history"])
		.catch("overview"),
	returnTo: payableSearchSchema.optional().catch(undefined),
});
export type PayableWorkspaceSearch = z.infer<
	typeof payableWorkspaceSearchSchema
>;
