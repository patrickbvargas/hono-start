import * as z from "zod";
import { pendingWorkSearchSchema } from "@/features/pending-work";
import { contractSearchSchema } from "./search";
export const contractWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "finance", "team", "attachments", "history"])
		.catch("overview"),
	returnTo: contractSearchSchema.optional().catch(undefined),
	pendingReturnTo: pendingWorkSearchSchema.optional().catch(undefined),
});
export type ContractWorkspaceSearch = z.infer<
	typeof contractWorkspaceSearchSchema
>;
