import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../src/shared/lib/prisma";

try {
	const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const [roles, organizations, firms, employees, users, adminCandidates] = await Promise.all([
		client.organizationRoles.getOrganizationRoleList({ limit: 100 }),
		client.organizations.getOrganizationList({ limit: 100 }),
		prisma.firm.findMany({ select: { id: true, name: true } }),
		prisma.employee.count(),
client.users.getUserList({ limit: 100 }),
prisma.employee.findMany({ select: { id: true, fullName: true } }),
	]);
	console.info(JSON.stringify({
		roles: roles.data.map((role) => ({ key: role.key, permissions: role.permissions.map((permission) => permission.key) })),
		organizations: organizations.data.map((organization) => ({ id: organization.id, name: organization.name })),
		firms, employeeCount: employees,
clerkUsers: users.data.map((user) => ({ id: user.id, name: user.firstName, matchingAdminIds: adminCandidates.filter((employee) => employee.id === user.privateMetadata.employeeId).map((employee) => employee.id) })),
adminCandidates: adminCandidates.map(({ id, fullName }) => ({ id, fullName })),
webhookConfigured: Boolean(process.env.CLERK_WEBHOOK_SIGNING_SECRET),
	}, null, 2));
} catch (error) {
	console.error("Readiness check failed", error && typeof error === "object" && "status" in error ? { status: error.status } : "Check provider and database configuration.");
	process.exitCode = 1;
} finally {
	await prisma.$disconnect();
}
