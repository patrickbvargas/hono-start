import "dotenv/config";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClerkClient } from "@clerk/backend";
import * as z from "zod";
import { prisma } from "../src/shared/lib/prisma";

const mappingSchema = z.object({
	firms: z.array(z.object({ id: z.number().int(), organizationId: z.string().startsWith("org_").nullable() })),
	employees: z.array(z.object({
		id: z.number().int(), firmId: z.number().int(),
		userId: z.string().startsWith("user_").nullable(),
		role: z.string().regex(/^org:[a-z0-9_]+$/),
		enableAccess: z.boolean(),
	})),
});

function argument(name: string) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
	const employees = await prisma.employee.findMany({ orderBy: { id: "asc" } });
	const firms = await prisma.firm.findMany({ orderBy: { id: "asc" } });
	const applying = process.argv.includes("--apply");
	const mappingPath = resolve(argument("--mapping") ?? ".clerk-migration/mapping.json");
	if (!applying) {
		const mapping = {
			firms: firms.map((firm) => ({ id: firm.id, organizationId: firm.clerkOrganizationId })),
			employees: employees.map((employee) => ({
				id: employee.id, firmId: employee.firmId, userId: employee.clerkUserId,
				role: "org:member", enableAccess: false,
				legacyIdentityPresent: Boolean(employee.authUserId),
				inactive: !employee.isActive, deleted: Boolean(employee.deletedAt),
				providerSetupRequired: true, legacyForcedReset: employee.mustChangePassword,
			})),
		};
		await mkdir(dirname(mappingPath), { recursive: true });
		await writeFile(mappingPath, JSON.stringify(mapping, null, 2), { flag: "wx", mode: 0o600 });
		console.info(`Dry run: ${firms.length} firms, ${employees.length} employees. Mapping written; all access disabled for review.`);
		return;
	}
	const mapping = mappingSchema.parse(JSON.parse(await readFile(mappingPath, "utf8")));
	if (!process.env.CLERK_SECRET_KEY) { throw new Error("CLERK_SECRET_KEY required"); }
	const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
	for (const row of mapping.firms) {
		const firm = firms.find((item) => item.id === row.id);
		if (!firm) { throw new Error(`Unknown firm ${row.id}`); }
		let organizationId = firm.clerkOrganizationId ?? row.organizationId;
		if (!organizationId) {
			const slug = `hono-firm-${firm.id}`;
			let existing;
			try { existing = await client.organizations.getOrganization({ slug }); }
			catch (error) {
				if (!error || typeof error !== "object" || !("status" in error) || error.status !== 404) { throw error; }
			}
			if (existing && existing.privateMetadata.honoFirmId !== firm.id) { throw new Error("Organization mapping collision"); }
			organizationId = (existing ?? await client.organizations.createOrganization({ name: firm.name, slug, privateMetadata: { honoFirmId: firm.id } })).id;
		}
		await client.organizations.getOrganization({ organizationId });
		await prisma.firm.update({ where: { id: firm.id }, data: { clerkOrganizationId: organizationId } });
	}
	for (const row of mapping.employees) {
		const employee = employees.find((item) => item.id === row.id && item.firmId === row.firmId);
		if (!employee) { throw new Error(`Unknown employee mapping ${row.id}`); }
		if (row.enableAccess && (!employee.isActive || employee.deletedAt)) { throw new Error(`Restricted employee ${row.id}`); }
		// Legacy provider revocation must be checked before explicitly enabling migrated accounts.
		if (row.enableAccess && employee.authUserId) {
			const source = await prisma.$queryRaw<Array<{ banned_until: Date | null }>>`
				SELECT banned_until FROM auth.users WHERE id = ${employee.authUserId}::uuid`;
			if (source.length !== 1 || (source[0].banned_until && source[0].banned_until > new Date())) {
				throw new Error(`Legacy access unavailable or revoked for employee ${row.id}`);
			}
		}
		let userId = employee.clerkUserId ?? row.userId;
		if (employee.clerkUserId && row.userId && employee.clerkUserId !== row.userId) { throw new Error("User mapping collision"); }
		if (!userId && row.enableAccess) {
			const existing = await client.users.getUserList({ externalId: [`hono:employee:${employee.id}`], limit: 2 });
			if (existing.data.length > 1) { throw new Error("Duplicate external identity"); }
			userId = (existing.data[0] ?? await client.users.createUser({ externalId: `hono:employee:${employee.id}`, emailAddress: [employee.email], skipPasswordRequirement: true })).id;
		}
		if (!userId) { continue; }
		await client.users.getUser(userId);
		await prisma.employee.update({ where: { id: employee.id }, data: { clerkUserId: userId } });
		const firm = await prisma.firm.findUniqueOrThrow({ where: { id: employee.firmId } });
		if (!firm.clerkOrganizationId) { throw new Error("Missing firm mapping"); }
		const current = await client.organizations.getOrganizationMembershipList({ organizationId: firm.clerkOrganizationId, userId: [userId], limit: 2 });
		if (row.enableAccess) {
			if (current.data.length) {
				await client.organizations.updateOrganizationMembership({ organizationId: firm.clerkOrganizationId, userId, role: row.role });
			} else {
				await client.organizations.createOrganizationMembership({ organizationId: firm.clerkOrganizationId, userId, role: row.role });
			}
		} else if (current.data.length) {
			await client.organizations.deleteOrganizationMembership({ organizationId: firm.clerkOrganizationId, userId });
		}
	}
	console.info("Clerk mappings reconciled. Users complete Clerk email verification/setup; no passwords imported.");
}

main().catch(() => { console.error("Clerk migration failed. Review mapping and provider state before retry; no credential details logged."); process.exitCode = 1; })
	.finally(() => prisma.$disconnect());
