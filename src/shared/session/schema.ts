import * as z from "zod";

// This catalog names checks. Role grants are configured exclusively in Clerk.
export const clerkPermissionCatalog = {
	clients: ["read", "create", "update", "delete", "restore"],
	contracts: [
		"read_all",
		"read_assigned",
		"create",
		"update_all",
		"update_assigned",
		"delete",
		"restore",
	],
	fees: ["read_all", "read_assigned", "create", "update", "delete", "restore"],
	expenses: ["read", "create", "update", "delete", "restore"],
	remunerations: [
		"read_all",
		"read_own",
		"update",
		"delete",
		"restore",
		"export_all",
		"export_own",
	],
	attachments: ["read", "upload", "delete"],
	employees: ["read", "create", "update", "delete", "restore"],
	accounts: ["manage"],
	audit_logs: ["read"],
	dashboard: ["read_all", "read_own", "read_cash_flow"],
} as const;

export type ClerkPermission = {
	[K in keyof typeof clerkPermissionCatalog]: `org:${K}:${(typeof clerkPermissionCatalog)[K][number]}`;
}[keyof typeof clerkPermissionCatalog];

export const clerkPermissions = Object.entries(clerkPermissionCatalog).flatMap(
	([feature, actions]) => actions.map((action) => `org:${feature}:${action}`),
) as ClerkPermission[];

export const clerkPermissionSchema = z.custom<ClerkPermission>(
	(value) =>
		typeof value === "string" &&
		clerkPermissions.includes(value as ClerkPermission),
);

const sessionOptionSchema = z.object({
	id: z.number().int(),
	value: z.string(),
	label: z.string(),
});

export const clerkIdentitySchema = z.object({
	userId: z.string().startsWith("user_"),
	organizationId: z.string().startsWith("org_"),
	sessionId: z.string().startsWith("sess_"),
});

export const loggedUserSessionSchema = z.object({
	user: z.object({
		fullName: z.string(),
		email: z.email(),
	}),
	employee: z.object({ id: z.number().int().nullable() }),
	firm: z.object({ id: z.number().int(), name: z.string() }),
	employeeType: sessionOptionSchema.nullable(),
	clerk: clerkIdentitySchema,
	permissions: z.array(clerkPermissionSchema),
});

export const SESSION_EMPLOYEE_TYPE_LAWYER_VALUE = "LAWYER" as const;
export const SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE =
	"ADMIN_ASSISTANT" as const;
export const SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE = "RESPONSIBLE" as const;
export const SESSION_ASSIGNMENT_TYPE_RECOMMENDING_VALUE =
	"RECOMMENDING" as const;
export const SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE = "RECOMMENDED" as const;
export const SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE =
	"ADMIN_ASSISTANT" as const;
export const CONTRACT_STATUS_ACTIVE_VALUE = "ACTIVE" as const;
export const CONTRACT_STATUS_CANCELLED_VALUE = "CANCELLED" as const;
export const CONTRACT_STATUS_COMPLETED_VALUE = "COMPLETED" as const;

export type LoggedUserSession = z.infer<typeof loggedUserSessionSchema>;

export const sessionConfigurationIssueSchema = z.enum([
	"employee_missing",
	"employee_invalid",
	"employee_unavailable",
	"firm_missing",
	"firm_invalid",
	"firm_unavailable",
]);

export type SessionConfigurationIssue = z.infer<
	typeof sessionConfigurationIssueSchema
>;

export const sessionAccessSchema = z.discriminatedUnion("status", [
	z.object({ status: z.literal("ready"), session: loggedUserSessionSchema }),
	z.object({
		status: z.literal("configuration_required"),
		issues: z.array(sessionConfigurationIssueSchema).min(1),
	}),
	z.object({ status: z.literal("unauthenticated") }),
]);

export type SessionAccess = z.infer<typeof sessionAccessSchema>;

export type SessionScopeSubject =
	| "employee"
	| "client"
	| "contract"
	| "fee"
	| "expense"
	| "remuneration"
	| "attachment"
	| "dashboard"
	| "audit-log";

interface SessionFirmResource {
	firmId: number;
}

export interface SessionAssignmentSummary {
	assignmentTypeValue: string;
	employeeId: number;
	employeeTypeValue: string;
}

export interface ContractAccessResource extends SessionFirmResource {
	assignedEmployeeIds?: number[];
	assignments?: SessionAssignmentSummary[];
	isAssignedToActor?: boolean;
	statusValue?: string;
	allowStatusChange?: boolean;
}

export type FeeAccessResource = ContractAccessResource;

export interface RemunerationAccessResource extends SessionFirmResource {
	employeeId: number;
}

export type SessionResource =
	| SessionFirmResource
	| ContractAccessResource
	| RemunerationAccessResource
	| null
	| undefined;

export interface SessionScope {
	firmId: number;
	employeeId?: number;
}
