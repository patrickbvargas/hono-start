import * as z from "zod";
import { clientSearchSchema } from "./search";
export const clientWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "contact", "attachments", "history"])
		.catch("overview"),
	returnTo: clientSearchSchema.optional().catch(undefined),
});
export type ClientWorkspaceSearch = z.infer<typeof clientWorkspaceSearchSchema>;
