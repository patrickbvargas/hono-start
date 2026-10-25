import * as z from "zod";
import { feeSearchSchema } from "./search";
export const feeWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "finance", "attachments", "history"])
		.catch("overview"),
	returnTo: feeSearchSchema.optional().catch(undefined),
});
export type FeeWorkspaceSearch = z.infer<typeof feeWorkspaceSearchSchema>;
