import "dotenv/config";
import { access, mkdir, writeFile } from "node:fs/promises";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../src/shared/lib/prisma";
import {
	type ClerkPermission,
	clerkPermissions,
} from "../src/shared/session/schema";

// Development bootstrap only; never a runtime grant matrix.
const memberGrants: ClerkPermission[] = [
	"org:clients:read",
	"org:contracts:read_assigned",
	"org:receivables:read_assigned",
	"org:receipts:read_assigned",
	"org:payables:read_own",
	"org:payments:read_own",
	"org:attachments:read",
	"org:dashboard:read_own",
];
const targetPermissions = clerkPermissions.filter(
	(key) =>
		!key.startsWith("org:fees:") && !key.startsWith("org:remunerations:"),
);
const arg = (name: string) => {
	const index = process.argv.indexOf(name);
	return index < 0 ? undefined : process.argv[index + 1];
};
async function main() {
	const key = process.env.CLERK_SECRET_KEY;
	if (!key) {
		throw new Error("CLERK_SECRET_KEY ausente");
	}
	const applying = process.argv.includes("--apply");
	if (applying && !key.startsWith("sk_test_")) {
		throw new Error("Setup restrito à instância de desenvolvimento");
	}
	const client = createClerkClient({ secretKey: key });
	const userId = arg("--user"),
		organizationId = arg("--organization"),
		personId = Number(arg("--person")),
		firmId = Number(arg("--firm"));
	if (
		!userId ||
		!organizationId ||
		!Number.isSafeInteger(personId) ||
		personId <= 0 ||
		!Number.isSafeInteger(firmId) ||
		firmId <= 0
	) {
		throw new Error(
			"Informe --user, --person, --organization e --firm explicitamente",
		);
	}
	const [
		roles,
		permissions,
		settings,
		user,
		organization,
		person,
		firm,
		memberships,
	] = await Promise.all([
		client.organizationRoles.getOrganizationRoleList({ limit: 100 }),
		client.organizationPermissions.getOrganizationPermissionList({
			limit: 100,
		}),
		client.instance.getOrganizationSettings(),
		client.users.getUser(userId),
		client.organizations.getOrganization({ organizationId }),
		prisma.person.findFirst({
			where: {
				id: personId,
				isActive: true,
				deletedAt: null,
				isEmployee: true,
				employeeProfile: { is: { isActive: true, deletedAt: null } },
			},
			select: { id: true },
		}),
		prisma.firm.findUnique({ where: { id: firmId }, select: { id: true } }),
		client.organizations.getOrganizationMembershipList({
			organizationId,
			userId: [userId],
			limit: 2,
		}),
	]);
	if (
		!person ||
		!firm ||
		!memberships.data.some((m) => m.publicUserData?.userId === userId)
	) {
		throw new Error(
			"Person/perfil, Firm e membership precisam ser válidos antes do setup",
		);
	}
	if (permissions.totalCount > permissions.data.length) {
		throw new Error(
			"Catálogo paginado: implemente paginação antes de alterar provedor",
		);
	}
	if (
		!roles.data.some((r) => r.key === "org:admin") ||
		!roles.data.some((r) => r.key === "org:member")
	) {
		throw new Error("Papéis Admin/Member ausentes");
	}
	console.log(
		JSON.stringify(
			{
				applying,
				targetPermissionCount: targetPermissions.length,
				create: targetPermissions.filter(
					(k) => !permissions.data.some((p) => p.key === k),
				),
				binding: { userId, personId, organizationId, firmId },
				memberReceiptCreation: false,
				providerSettings: {
					maxAllowedRoles: settings.maxAllowedRoles,
					maxAllowedPermissions: settings.maxAllowedPermissions,
				},
			},
			null,
			2,
		),
	);
	if (!applying) {
		return;
	}
	await mkdir(".clerk-migration", { recursive: true });
	const backup = ".clerk-migration/financial-before.json";
	try {
		await access(backup);
	} catch {
		await writeFile(
			backup,
			JSON.stringify(
				{
					roles: roles.data,
					permissions: permissions.data,
					user: { id: user.id, privateMetadata: user.privateMetadata },
					organization: {
						id: organization.id,
						privateMetadata: organization.privateMetadata,
					},
				},
				null,
				2,
			),
		);
	}
	const ids = new Map(permissions.data.map((p) => [p.key, p.id]));
	for (const permission of targetPermissions) {
		if (!ids.has(permission)) {
			const created =
				await client.organizationPermissions.createOrganizationPermission({
					key: permission,
					name: permission.split(":").slice(1).join(" / "),
				});
			ids.set(permission, created.id);
		}
	}
	for (const [roleKey, grants] of [
		["org:admin", targetPermissions],
		["org:member", memberGrants],
	] as const) {
		const role = roles.data.find((r) => r.key === roleKey);
		if (!role) {
			throw new Error("Required role missing");
		}
		const system = role.permissions
			.filter((p) => p.key.startsWith("org:sys_"))
			.map((p) => p.id);
		await client.organizationRoles.updateOrganizationRole({
			organizationRoleId: role.id,
			permissions: [
				...system,
				...grants.map((k) => {
					const id = ids.get(k);
					if (!id) {
						throw new Error("Missing grant");
					}
					return id;
				}),
			],
		});
	}
	await client.users.updateUserMetadata(userId, {
		privateMetadata: { personId, employeeId: null },
	});
	await client.organizations.updateOrganizationMetadata(organizationId, {
		privateMetadata: { firmId },
	});
	const [confirmedUser, confirmedOrg, confirmedRoles] = await Promise.all([
		client.users.getUser(userId),
		client.organizations.getOrganization({ organizationId }),
		client.organizationRoles.getOrganizationRoleList({ limit: 100 }),
	]);
	if (
		confirmedUser.privateMetadata.personId !== personId ||
		confirmedUser.privateMetadata.employeeId != null ||
		confirmedOrg.privateMetadata.firmId !== firmId
	) {
		throw new Error("Provider bindings verification failed");
	}
	for (const [roleKey, grants] of [
		["org:admin", targetPermissions],
		["org:member", memberGrants],
	] as const) {
		const actual = confirmedRoles.data
			.find((r) => r.key === roleKey)
			?.permissions.filter((p) => !p.key.startsWith("org:sys_"))
			.map((p) => p.key)
			.sort();
		if (JSON.stringify(actual) !== JSON.stringify([...grants].sort())) {
			throw new Error(`Provider role verification failed: ${roleKey}`);
		}
	}
	console.log(
		"Clerk development: roles, permissions and explicit Person/Firm bindings verified.",
	);
}
main()
	.catch((error) => {
		console.error(
			"Clerk setup failed",
			error instanceof Error ? error.message : "Provider error",
		);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
