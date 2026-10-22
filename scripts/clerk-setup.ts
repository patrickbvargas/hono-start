import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { clerkPermissions, type ClerkPermission } from "../src/shared/session/catalog";

// Initial development bootstrap only. This is never imported by runtime policy.
const memberGrants: ClerkPermission[] = [
	"org:clients:read", "org:clients:create", "org:clients:update",
	"org:contracts:read_assigned", "org:contracts:create", "org:contracts:update_assigned",
	"org:fees:read_assigned", "org:fees:create", "org:fees:update",
	"org:remunerations:read_own", "org:remunerations:export_own",
	"org:attachments:read", "org:attachments:upload", "org:dashboard:read_own",
];

try {
	const secretKey = process.env.CLERK_SECRET_KEY;
	if (!secretKey) { throw new Error("Missing key"); }
	const client = createClerkClient({ secretKey });
	const roles = await client.organizationRoles.getOrganizationRoleList({ limit: 100 });
	const permissions = await client.organizationPermissions.getOrganizationPermissionList({ limit: 100 });
	const applying = process.argv.includes("--apply");
	if (applying && !secretKey.startsWith("sk_test_")) { throw new Error("Automatic setup is restricted to development instances"); }
	console.info(JSON.stringify({ applying, permissionCount: clerkPermissions.length, create: clerkPermissions.filter((key) => !permissions.data.some((item) => item.key === key)), initialRoles: { "org:admin": clerkPermissions, "org:member": memberGrants } }, null, 2));
	if (applying) {
		const ids = new Map(permissions.data.map((permission) => [permission.key, permission.id]));
		for (const key of clerkPermissions) {
			if (!ids.has(key)) {
				const permission = await client.organizationPermissions.createOrganizationPermission({ key, name: key.split(":").at(-1) ?? key });
				ids.set(key, permission.id);
			}
		}
		for (const [key, grants] of [["org:admin", clerkPermissions], ["org:member", memberGrants]] as const) {
			const role = roles.data.find((item) => item.key === key);
			if (!role) { throw new Error("Required initial role missing"); }
			// Preserve provider-native System Permissions. Set business grants explicitly.
			const systemIds = role.permissions.filter((item) => item.key.startsWith("org:sys_")).map((item) => item.id);
			await client.organizationRoles.updateOrganizationRole({ organizationRoleId: role.id, permissions: [...systemIds, ...grants.map((grant) => {
				const id = ids.get(grant);
				if (!id) { throw new Error("Permission provisioning incomplete"); }
				return id;
			})] });
		}
		console.info("Development permission catalog and initial roles configured. Future role edits belong in Clerk.");
	}
} catch (error) {
	console.error("Clerk setup failed; inspect current provider state before retry.", error && typeof error === "object" && "status" in error ? { status: error.status } : "Check configuration.");
	process.exitCode = 1;
}
