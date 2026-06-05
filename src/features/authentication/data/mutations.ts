import { prisma } from "@/shared/lib/prisma";
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
			email: true,
			isAccessEnabled: true,
		},
	});

	if (!employee) {
		return null;
	}

	return {
		email: employee.email.toLowerCase(),
		isAccessEnabled: employee.isAccessEnabled,
	};
}
