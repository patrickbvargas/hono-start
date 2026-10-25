import * as z from "zod";
import { employeeSearchSchema } from "./search";
export const employeeWorkspaceSearchSchema = z.object({
	tab: z
		.enum(["overview", "finance", "attachments", "history"])
		.catch("overview"),
	returnTo: employeeSearchSchema.optional().catch(undefined),
});
export type EmployeeWorkspaceSearch = z.infer<
	typeof employeeWorkspaceSearchSchema
>;
