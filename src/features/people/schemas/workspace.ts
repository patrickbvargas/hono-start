import * as z from "zod";
import { personSearchSchema } from "./search";
export const personWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "contact", "finance", "attachments", "history"])
		.catch("overview"),
	returnTo: personSearchSchema.optional().catch(undefined),
});
export type PersonWorkspaceSearch = z.infer<typeof personWorkspaceSearchSchema>;
