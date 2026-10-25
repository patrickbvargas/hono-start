import * as z from "zod";
import { auditLogSearchSchema } from "./search";
export const auditLogWorkspaceSearchSchema = z.object({
	tab: z.enum(["overview", "changes", "technical"]).catch("overview"),
	returnTo: auditLogSearchSchema.optional().catch(undefined),
});
export type AuditLogWorkspaceSearch = z.infer<
	typeof auditLogWorkspaceSearchSchema
>;
