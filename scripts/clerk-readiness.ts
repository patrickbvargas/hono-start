import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../src/shared/lib/prisma";

async function main() {
	const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
	const [users, orgs, roles] = await Promise.all([
		client.users.getUserList({ limit: 100 }),
		client.organizations.getOrganizationList({ limit: 100 }),
		client.organizationRoles.getOrganizationRoleList({ limit: 100 }),
	]);
	const usersState = [];
	for (const user of users.data) {
		const personId = user.privateMetadata.personId;
		const person =
			typeof personId === "number" &&
			Number.isSafeInteger(personId) &&
			personId > 0
				? await prisma.person.findFirst({
						where: {
							id: personId,
							isActive: true,
							deletedAt: null,
							isEmployee: true,
							employeeProfile: { is: { isActive: true, deletedAt: null } },
						},
						select: { id: true },
					})
				: null;
		usersState.push({ userId: user.id, personId, valid: !!person });
	}
	const organizations = [];
	for (const org of orgs.data) {
		const firmId = org.privateMetadata.firmId;
		const firm =
			typeof firmId === "number" && Number.isSafeInteger(firmId) && firmId > 0
				? await prisma.firm.findUnique({
						where: { id: firmId },
						select: { id: true },
					})
				: null;
		organizations.push({ organizationId: org.id, firmId, valid: !!firm });
	}
	console.log(
		JSON.stringify(
			{
				users: usersState,
				organizations,
				roles: roles.data.map((r) => ({
					key: r.key,
					permissions: r.permissions.map((p) => p.key),
				})),
			},
			null,
			2,
		),
	);
	if (usersState.some((u) => !u.valid) || organizations.some((o) => !o.valid)) {
		process.exitCode = 1;
	}
}
main()
	.catch(() => {
		console.error(
			"Clerk readiness failed: confira configuração e conectividade.",
		);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
