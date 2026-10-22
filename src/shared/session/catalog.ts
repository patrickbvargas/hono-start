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
