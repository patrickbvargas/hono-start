import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import {
	type ClerkPermission,
	clerkPermissions,
} from "../src/shared/session/schema";

async function main() {
	const key = process.env.CLERK_SECRET_KEY;
	if (!key) {
		throw new Error("CLERK_SECRET_KEY ausente");
	}
	const client = createClerkClient({ secretKey: key });

	const [roles, permissions] = await Promise.all([
		client.organizationRoles.getOrganizationRoleList({ limit: 100 }),
		client.organizationPermissions.getOrganizationPermissionList({
			limit: 100,
		}),
	]);

	const targetPermissions = clerkPermissions.filter(
		(key) =>
			!key.startsWith("org:fees:") && !key.startsWith("org:remunerations:"),
	);

	const memberGrants: ClerkPermission[] = [
		"org:clients:read",
		"org:contracts:read_assigned",
		"org:receivables:read_assigned",
		"org:receipts:read_assigned",
		"org:payables:read_own",
		"org:payments:read_own",
		"org:attachments:read",
		"org:dashboard:read_own",
		"org:operational_overview:read_own",
	];

	const ids = new Map(permissions.data.map((p) => [p.key, p.id]));

	// Create any missing target permissions
	for (const permission of targetPermissions) {
		if (!ids.has(permission)) {
			console.log(`Creating permission: ${permission}`);
			const created =
				await client.organizationPermissions.createOrganizationPermission({
					key: permission,
					name: permission.split(":").slice(1).join(" / "),
				});
			ids.set(permission, created.id);
		}
	}

	// Update org:admin and org:member
	for (const [roleKey, grants] of [
		["org:admin", targetPermissions],
		["org:member", memberGrants],
	] as const) {
		const role = roles.data.find((r) => r.key === roleKey);
		if (!role) {
			console.warn(`Role ${roleKey} not found`);
			continue;
		}

		const system = role.permissions
			.filter((p) => p.key.startsWith("org:sys_"))
			.map((p) => p.id);

		const updatedPermissionIds = [
			...system,
			...grants
				.map((k) => ids.get(k))
				.filter((id): id is string => Boolean(id)),
		];

		await client.organizationRoles.updateOrganizationRole({
			organizationRoleId: role.id,
			permissions: updatedPermissionIds,
		});
		console.log(`Updated role ${roleKey} with ${updatedPermissionIds.length} permissions.`);
	}

	// Check if old org:dashboard:read_cash_flow can be deleted
	const oldCashFlowPerm = permissions.data.find((p) => p.key === "org:dashboard:read_cash_flow");
	if (oldCashFlowPerm) {
		try {
			await client.organizationPermissions.deleteOrganizationPermission(oldCashFlowPerm.id);
			console.log("Deleted obsolete permission: org:dashboard:read_cash_flow");
		} catch (err) {
			console.warn("Could not delete org:dashboard:read_cash_flow (may still be referenced):", err);
		}
	}

	console.log("Clerk permissions sync complete!");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
