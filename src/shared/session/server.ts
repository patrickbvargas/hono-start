import { getRequestHeaders } from "@tanstack/react-start/server";
import { AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS, auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import type {
	LoggedUserSession,
	SessionScope,
	SessionScopeSubject,
} from "./model";
import { getScope } from "./scope";

const UNAUTHENTICATED_ERROR_MESSAGE =
	"Sua sessão expirou. Faça login novamente.";

function getAuthenticationExpiresAt(session: {
	createdAt: Date;
	rememberMe?: boolean | null;
	expiresAt: Date;
}) {
	if (session.rememberMe) {
		return session.expiresAt;
	}

	return new Date(
		session.createdAt.getTime() + AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS * 1000,
	);
}

async function resolveDomainSession(): Promise<LoggedUserSession | null> {
	const headers = getRequestHeaders();
	const authSession = await auth.api.getSession({
		headers,
	});

	if (!authSession?.session || !authSession.user?.employeeId) {
		return null;
	}

	const authenticationExpiresAt = getAuthenticationExpiresAt(
		authSession.session,
	);
	if (authenticationExpiresAt.getTime() <= Date.now()) {
		await auth.api.signOut({
			headers,
		});
		return null;
	}

	const employee = await prisma.employee.findFirst({
		where: {
			id: authSession.user.employeeId,
			deletedAt: null,
			isActive: true,
		},
		select: {
			id: true,
			fullName: true,
			email: true,
			firm: {
				select: {
					id: true,
					name: true,
				},
			},
			role: {
				select: {
					id: true,
					value: true,
					label: true,
				},
			},
			type: {
				select: {
					id: true,
					value: true,
					label: true,
				},
			},
		},
	});

	if (!employee) {
		await auth.api.signOut({
			headers,
		});
		return null;
	}

	return {
		user: {
			id: employee.id,
			fullName: employee.fullName,
			email: employee.email,
		},
		employee: {
			id: employee.id,
		},
		firm: employee.firm,
		employeeType: employee.type,
		role: employee.role,
	};
}

export async function getOptionalServerLoggedUserSession() {
	return resolveDomainSession();
}

export async function getRequiredServerLoggedUserSession() {
	const session = await resolveDomainSession();

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
