import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import * as z from "zod";
import { prisma } from "@/shared/lib/prisma";
import { getScope } from "./access";
import type {
	LoggedUserSession,
	SessionScope,
	SessionScopeSubject,
} from "./schema";
import { clerkPermissionSchema, loggedUserSessionSchema } from "./schema";

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
	const metadata = z
		.object({ employeeId: z.number().int().positive().optional() })
		.safeParse(user.privateMetadata ?? {});
	if (!metadata.success) {
		return null;
	}
	const employee = metadata.data.employeeId
		? await prisma.employee.findFirst({
				where: {
					id: metadata.data.employeeId,
					deletedAt: null,
					isActive: true,
				},
				select: {
					id: true,
					type: { select: { id: true, value: true, label: true } },
				},
			})
		: null;
	if (metadata.data.employeeId && !employee) {
		return null;
	}
	const firm = await prisma.firm.findFirst({
		orderBy: { id: "asc" },
		select: { id: true, name: true },
	});
	if (!firm) {
		return null;
	}
	const permissions = membership.permissions.flatMap((value) => {
		const result = clerkPermissionSchema.safeParse(value);
		return result.success &&
			(employee || (!value.endsWith("_own") && !value.endsWith("_assigned")))
			? [result.data]
			: [];
	});
	return loggedUserSessionSchema.parse({
		user: {
			fullName:
				[user.firstName, user.lastName].filter(Boolean).join(" ") ||
				user.username ||
				"Usuário",
			email:
				user.emailAddresses.find(
					(address) => address.id === user.primaryEmailAddressId,
				)?.emailAddress ?? user.emailAddresses[0]?.emailAddress,
		},
		employee: { id: employee?.id ?? null },
		firm,
		employeeType: employee?.type ?? null,
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

export const getOptionalServerLoggedUserSession = createServerOnlyFn(
	async () => {
		const request = getRequest();
		const existing = requestSessions.get(request);
		if (existing) {
			return existing;
		}
		const pending = resolveDomainSession();
		requestSessions.set(request, pending);
		return pending;
	},
);

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

export interface AuthenticatedServerFunctionContext {
	session: LoggedUserSession;
}

export const authMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const session = await getRequiredServerLoggedUserSession();

	return next({
		context: {
			session,
		} satisfies AuthenticatedServerFunctionContext,
	});
});
