import { clerkClient } from "@clerk/tanstack-react-start/server";
import { prisma } from "@/shared/lib/prisma";
import type { LoggedUserSession } from "@/shared/session";

export async function getEmployeeClerkAccess(
	firmId: number,
	userId: string | null,
	email?: string,
) {
	const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } });
	if (!firm.clerkOrganizationId || !userId) {
		return {
			hasCredentialAccount: false,
			isAccessActive: false,
			status: "NOT_GRANTED" as const,
			role: null,
		};
	}
	const { data } =
		await clerkClient().organizations.getOrganizationMembershipList({
			organizationId: firm.clerkOrganizationId,
			userId: [userId],
			limit: 2,
		});
	const membership = data.find(
		(item) => item.publicUserData?.userId === userId,
	);
	let pendingRole: string | null = null;
	if (!membership && email) {
		let offset = 0;
		while (true) {
			const page =
				await clerkClient().organizations.getOrganizationInvitationList({
					organizationId: firm.clerkOrganizationId,
					status: ["pending"],
					limit: 100,
					offset,
				});
			const invitation = page.data.find(
				(item) => item.emailAddress.toLowerCase() === email.toLowerCase(),
			);
			if (invitation) {
				pendingRole = invitation.role;
				break;
			}
			offset += page.data.length;
			if (offset >= page.totalCount || !page.data.length) {
				break;
			}
		}
	}
	return {
		hasCredentialAccount: true,
		isAccessActive: Boolean(membership),
		status: membership
			? ("ACTIVE" as const)
			: pendingRole
				? ("PENDING" as const)
				: ("REVOKED" as const),
		role: membership?.role ?? pendingRole,
	};
}

export async function getAssignableClerkRoles(session: LoggedUserSession) {
	const client = clerkClient();
	if (!session.clerk || !session.permissions?.includes("org:accounts:manage")) {
		return [];
	}
	const { data: memberships } =
		await client.organizations.getOrganizationMembershipList({
			organizationId: session.clerk.organizationId,
			userId: [session.clerk.userId],
			limit: 2,
		});
	const grants =
		memberships.find(
			(item) => item.publicUserData?.userId === session.clerk?.userId,
		)?.permissions ?? [];
	if (!grants.includes("org:accounts:manage")) {
		return [];
	}
	const roles = await client.organizationRoles.getOrganizationRoleList({
		limit: 100,
	});
	return roles.data.filter((role) =>
		role.permissions.every((permission) => grants.includes(permission.key)),
	);
}

export async function assertAssignableClerkRole(
	session: LoggedUserSession,
	key: string,
) {
	const role = (await getAssignableClerkRoles(session)).find(
		(item) => item.key === key,
	);
	if (!role) {
		throw new Error("Perfil não disponível para concessão por sua conta.");
	}
	return role;
}
