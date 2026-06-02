import { prisma } from "@/shared/lib/prisma";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";
import { getScope } from "./scope";
import type {
	LoggedUserSession,
	SessionScope,
	SessionScopeSubject,
} from "./types";

const UNAUTHENTICATED_ERROR_MESSAGE =
	"Sua sessão expirou. Faça login novamente.";

async function resolveDomainSession(): Promise<LoggedUserSession | null> {
	const { client, flushResponseCookies } = createSupabaseServerClient();
	const {
		data: { user: authUser },
		error,
	} = await client.auth.getUser();

	flushResponseCookies();

	if (error || !authUser?.id) {
		return null;
	}

	const employee = await prisma.employee.findFirst({
		where: {
			supabaseAuthUserId: authUser.id,
			deletedAt: null,
			isActive: true,
			isAccessEnabled: true,
		},
		select: {
			id: true,
			fullName: true,
			email: true,
			mustChangePassword: true,
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
		const { client: signOutClient, flushResponseCookies: flushSignOutCookies } =
			createSupabaseServerClient();
		await signOutClient.auth.signOut({
			scope: "local",
		});
		flushSignOutCookies();
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
		mustChangePassword: employee.mustChangePassword,
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
