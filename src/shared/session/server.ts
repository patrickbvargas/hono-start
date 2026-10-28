import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import * as z from "zod";
import { prisma } from "@/shared/lib/prisma";
import { getScope } from "./access";
import type {
	LoggedUserSession,
	SessionAccess,
	SessionConfigurationIssue,
	SessionScope,
	SessionScopeSubject,
} from "./schema";
import {
	clerkPermissionSchema,
	loggedUserSessionSchema,
	sessionAccessSchema,
} from "./schema";

const UNAUTHENTICATED_ERROR_MESSAGE =
	"Sua sessão expirou. Faça login novamente.";

const organizationPrivateMetadataSchema = z.object({
	firmId: z.number().int().positive(),
});

async function resolveDomainSession(): Promise<SessionAccess> {
	const identity = await auth();
	if (
		!identity.userId ||
		!identity.orgId ||
		!identity.sessionId ||
		!identity.isAuthenticated
	) {
		return { status: "unauthenticated" };
	}
	const client = clerkClient();
	const [providerSession, user, { data }, organization] = await Promise.all([
		client.sessions.getSession(identity.sessionId),
		client.users.getUser(identity.userId),
		client.organizations.getOrganizationMembershipList({
			organizationId: identity.orgId,
			userId: [identity.userId],
			limit: 2,
		}),
		client.organizations.getOrganization({ organizationId: identity.orgId }),
	]);
	if (
		providerSession.status !== "active" ||
		providerSession.userId !== identity.userId ||
		user.banned ||
		user.locked
	) {
		return { status: "unauthenticated" };
	}
	const membership = data.find(
		(item) => item.publicUserData?.userId === identity.userId,
	);
	if (!membership) {
		return { status: "unauthenticated" };
	}
	const organizationMetadata = organizationPrivateMetadataSchema.safeParse(
		organization.privateMetadata ?? {},
	);
	const metadata = z
		.object({ employeeId: z.number().int().positive() })
		.safeParse(user.privateMetadata ?? {});
	const issues: SessionConfigurationIssue[] = [];
	if (!metadata.success) {
		issues.push(
			user.privateMetadata?.employeeId === undefined
				? "employee_missing"
				: "employee_invalid",
		);
	}
	if (!organizationMetadata.success) {
		issues.push(
			organization.privateMetadata?.firmId === undefined
				? "firm_missing"
				: "firm_invalid",
		);
	}
	if (!metadata.success || !organizationMetadata.success) {
		return { status: "configuration_required", issues };
	}
	const firm = await prisma.firm.findUnique({
		where: { id: organizationMetadata.data.firmId },
		select: { id: true, name: true },
	});
	if (!firm) {
		issues.push("firm_unavailable");
	}
	const employee = await prisma.employee.findFirst({
		where: {
			id: metadata.data.employeeId,
			deletedAt: null,
			isActive: true,
		},
		select: {
			id: true,
			type: { select: { id: true, value: true, label: true } },
		},
	});
	if (!employee) {
		issues.push("employee_unavailable");
	}
	if (!firm || !employee) {
		return { status: "configuration_required", issues };
	}
	const permissions = membership.permissions.flatMap((value) => {
		const result = clerkPermissionSchema.safeParse(value);
		return result.success ? [result.data] : [];
	});
	const session = loggedUserSessionSchema.parse({
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
		employee: { id: employee.id },
		firm,
		employeeType: employee.type,
		permissions,
		clerk: {
			userId: identity.userId,
			organizationId: identity.orgId,
			sessionId: identity.sessionId,
		},
	});
	return { status: "ready", session };
}

const requestSessions = new WeakMap<Request, Promise<SessionAccess>>();

export const getServerSessionAccess = createServerOnlyFn(async () => {
	const request = getRequest();
	const existing = requestSessions.get(request);
	if (existing) {
		return existing;
	}
	const pending = resolveDomainSession().then((result) =>
		sessionAccessSchema.parse(result),
	);
	requestSessions.set(request, pending);
	return pending;
});

export const getOptionalServerLoggedUserSession = createServerOnlyFn(
	async (): Promise<LoggedUserSession | null> => {
		const access = await getServerSessionAccess();
		return access.status === "ready" ? access.session : null;
	},
);

export async function getRequiredServerLoggedUserSession() {
	const access = await getServerSessionAccess();
	if (access.status === "configuration_required") {
		throw new Error(
			"Configuração de acesso incompleta. Peça ao administrador para conferir os vínculos do usuário e da organização no Clerk.",
		);
	}
	if (access.status !== "ready") {
		throw new Error(UNAUTHENTICATED_ERROR_MESSAGE);
	}

	return access.session;
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
