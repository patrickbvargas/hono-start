import * as z from "zod";
import { receivableSearchSchema } from "./search";
export const receivableWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "receipts", "attachments", "history"])
		.catch("overview"),
	returnTo: receivableSearchSchema.optional().catch(undefined),
});
export type ReceivableWorkspaceSearch = z.infer<
	typeof receivableWorkspaceSearchSchema
>;
