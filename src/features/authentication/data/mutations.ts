import { prisma } from "@/shared/lib/prisma";
import {
	isEmailIdentifier,
	normalizeAuthenticationIdentifier,
} from "../utils/normalization";

const FAILED_LOGIN_WINDOW_MS = 60 * 1000;

export async function countRecentFailedLoginAttempts(identifier: string) {
	const since = new Date(Date.now() - FAILED_LOGIN_WINDOW_MS);

	return prisma.failedLoginAttempt.count({
		where: {
			normalizedIdentifier: identifier,
			attemptedAt: {
				gte: since,
			},
		},
	});
}

export async function recordFailedLoginAttempt(identifier: string) {
	return prisma.failedLoginAttempt.create({
		data: {
			normalizedIdentifier: identifier,
		},
	});
}

export async function clearFailedLoginAttempts(identifier: string) {
	return prisma.failedLoginAttempt.deleteMany({
		where: {
			normalizedIdentifier: identifier,
		},
	});
}

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
		},
		select: {
			email: true,
		},
	});

	return employee?.email.toLowerCase() ?? null;
}
