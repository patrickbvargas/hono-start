import * as z from "zod";
import { expenseSearchSchema } from "./search";
export const expenseWorkspaceSearchSchema = z.object({
	tab: z.enum(["overview", "attachments", "history"]).catch("overview"),
	returnTo: expenseSearchSchema.optional().catch(undefined),
});
export type ExpenseWorkspaceSearch = z.infer<
	typeof expenseWorkspaceSearchSchema
>;
