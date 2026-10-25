import * as z from "zod";
import { remunerationSearchSchema } from "./search";
export const remunerationWorkspaceSearchSchema = z.object({
	tab: z.enum(["overview", "finance", "history"]).catch("overview"),
	returnTo: remunerationSearchSchema.optional().catch(undefined),
});
export type RemunerationWorkspaceSearch = z.infer<
	typeof remunerationWorkspaceSearchSchema
>;
