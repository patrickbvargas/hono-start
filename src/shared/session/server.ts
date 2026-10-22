import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { getRequest } from "@tanstack/react-start/server";
import { prisma } from "@/shared/lib/prisma";
import { clerkPermissionSchema } from "./catalog";
import { loggedUserSessionSchema } from "./schema";
import { getScope } from "./scope";
import type {
	LoggedUserSession,
	SessionScope,
	SessionScopeSubject,
} from "./types";

const UNAUTHENTICATED_ERROR_MESSAGE =
	"Sua sessão expirou. Faça login novamente.";

async function resolveDomainSession(): Promise<LoggedUserSession | null> {
	const identity = await auth();
	if (
		!identity.userId ||
		!identity.orgId ||
		!identity.sessionId ||
		!identity.isAuthenticated
	) {
		return null;
	}
	const client = clerkClient();
	const [providerSession, user, { data }] = await Promise.all([
		client.sessions.getSession(identity.sessionId),
		client.users.getUser(identity.userId),
		client.organizations.getOrganizationMembershipList({
			organizationId: identity.orgId,
			userId: [identity.userId],
			limit: 2,
		}),
	]);
	if (
		providerSession.status !== "active" ||
		providerSession.userId !== identity.userId ||
		user.banned ||
		user.locked
	) {
		return null;
	}
	const membership = data.find(
		(item) => item.publicUserData?.userId === identity.userId,
	);
	if (!membership) {
		return null;
	}
	const employee = await prisma.employee.findFirst({
		where: {
			clerkUserId: identity.userId,
			firm: { clerkOrganizationId: identity.orgId },
			deletedAt: null,
			isActive: true,
		},
		select: {
			id: true,
			fullName: true,
			email: true,
			firm: { select: { id: true, name: true } },
			type: { select: { id: true, value: true, label: true } },
		},
	});
	if (!employee) {
		return null;
	}
	const permissions = membership.permissions.flatMap((value) => {
		const result = clerkPermissionSchema.safeParse(value);
		return result.success ? [result.data] : [];
	});
	return loggedUserSessionSchema.parse({
		user: {
			id: employee.id,
			fullName: employee.fullName,
			email: employee.email,
		},
		employee: { id: employee.id },
		firm: employee.firm,
		employeeType: employee.type,
		role: { id: 0, value: membership.role, label: membership.role },
		mustChangePassword: false,
		permissions,
		clerk: {
			userId: identity.userId,
			organizationId: identity.orgId,
			sessionId: identity.sessionId,
		},
	});
}

const requestSessions = new WeakMap<
	Request,
	Promise<LoggedUserSession | null>
>();

export async function getOptionalServerLoggedUserSession() {
	const request = getRequest();
	const existing = requestSessions.get(request);
	if (existing) {
		return existing;
	}
	const pending = resolveDomainSession();
	requestSessions.set(request, pending);
	return pending;
}

export async function getRequiredServerLoggedUserSession() {
	const session = await getOptionalServerLoggedUserSession();

	if (!session) {
		throw new Error(UNAUTHENTICATED_ERROR_MESSAGE);
	}

	return session;
}

export async function getServerScope(
	subject: SessionScopeSubject,
): Promise<SessionScope> {
	return getScope(await getRequiredServerLoggedUserSession(), subject);
}
