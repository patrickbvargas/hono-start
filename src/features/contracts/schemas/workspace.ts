import * as z from "zod";
import { contractSearchSchema } from "./search";
export const contractWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "finance", "team", "attachments", "history"])
		.catch("overview"),
	returnTo: contractSearchSchema.optional().catch(undefined),
});
export type ContractWorkspaceSearch = z.infer<
	typeof contractWorkspaceSearchSchema
>;
