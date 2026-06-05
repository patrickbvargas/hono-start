import { prisma } from "@/shared/lib/prisma";
import { getSupabaseCredentialAccessState } from "@/shared/lib/supabase-admin";
import {
	isEmailIdentifier,
	normalizeAuthenticationIdentifier,
} from "../utils/normalization";

export async function resolveAuthenticationEmail(identifier: string) {
	const normalizedIdentifier = normalizeAuthenticationIdentifier(identifier);
	const where = isEmailIdentifier(normalizedIdentifier)
		? { email: normalizedIdentifier }
		: { oabNumber: normalizedIdentifier };

	const employee = await prisma.employee.findFirst({
		where: {
			...where,
			deletedAt: null,
			isActive: true,
			authUserId: {
				not: null,
			},
		},
		select: {
			authUserId: true,
			email: true,
		},
	});

	if (!employee) {
		return null;
	}

	const accessState = await getSupabaseCredentialAccessState(
		employee.authUserId,
	);

	return {
		authUserId: employee.authUserId,
		email: employee.email.toLowerCase(),
		isAccessActive: accessState.isAccessActive,
	};
}
