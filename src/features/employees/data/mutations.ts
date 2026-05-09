import { randomInt, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import type {
	EntityInputParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import {
	assertRoleCanBeSelected,
	assertRoleExists,
	assertTypeCanBeSelected,
	assertTypeExists,
} from "../rules/lookups";
import type { EmployeeCreateInput, EmployeeUpdateInput } from "../schemas/form";
import {
	getEmployeeById,
	getEmployeeTypeByValue,
	getUserRoleByValue,
} from "./queries";

interface ResetEmployeePasswordReturnType extends MutationReturnType {
	temporaryPassword: string;
}

interface GrantEmployeeAccessReturnType extends MutationReturnType {
	temporaryPassword: string;
}

const TEMPORARY_PASSWORD_WORDS = [
	"MANGA",
	"BRISA",
	"FARO",
	"LIVRO",
	"TRAMA",
	"PRADO",
	"VELOZ",
	"PORTA",
];

const TEMPORARY_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ2346789";

function randomIndex(max: number) {
	return randomInt(max);
}

function randomCharacters(length: number) {
	return Array.from({ length }, () => {
		return TEMPORARY_PASSWORD_ALPHABET[
			randomIndex(TEMPORARY_PASSWORD_ALPHABET.length)
		];
	}).join("");
}

function createTemporaryPassword() {
	if (randomInt(2) === 1) {
		const word =
			TEMPORARY_PASSWORD_WORDS[randomIndex(TEMPORARY_PASSWORD_WORDS.length)];
		const suffix = Array.from({ length: 4 }, () => randomIndex(10)).join("");
		return `${word}-${suffix}`;
	}

	return `${randomCharacters(4)}-${randomCharacters(4)}`;
}

async function createOrUpdateCredentialAccount(params: {
	tx: Prisma.TransactionClient;
	authUserId: string;
	accountId?: string;
	passwordHash: string;
}) {
	if (params.accountId) {
		await params.tx.account.update({
			where: {
				id: params.accountId,
			},
			data: {
				password: params.passwordHash,
			},
		});
		return;
	}

	await params.tx.account.create({
		data: {
			id: randomUUID(),
			accountId: params.authUserId,
			providerId: "credential",
			userId: params.authUserId,
			password: params.passwordHash,
		},
	});
}

function normalizeNullableString(value: string | null | undefined) {
	return value?.trim() || null;
}

export async function createEmployee({
	actor,
	firmId,
	input,
}: EntityInputParams<EmployeeCreateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const [type, role] = await Promise.all([
		getEmployeeTypeByValue(input.type),
		getUserRoleByValue(input.role),
	]);

	assertTypeExists(type);
	assertRoleExists(role);
	assertTypeCanBeSelected(type);
	assertRoleCanBeSelected(role);

	await prisma.$transaction(async (tx) => {
		const employee = await tx.employee.create({
			data: {
				firmId,
				fullName: input.fullName,
				email: input.email,
				typeId: type.id,
				roleId: role.id,
				oabNumber: input.oabNumber || null,
				remunerationPercentage: input.remunerationPercent,
				referralPercentage: input.referrerPercent,
				isActive: input.isActive,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "CREATE",
			entityType: "Employee",
			entityId: employee.id,
			entityName: employee.fullName,
			changeData: input,
			description: `Created employee ${employee.fullName}.`,
		});
	});

	return { success: true };
}

export async function updateEmployee({
	actor,
	firmId,
	input,
}: EntityInputParams<EmployeeUpdateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id: input.id });
	if (employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	const [type, role] = await Promise.all([
		getEmployeeTypeByValue(input.type),
		getUserRoleByValue(input.role),
	]);

	assertTypeExists(type);
	assertRoleExists(role);
	assertTypeCanBeSelected(type, employee.typeId);
	assertRoleCanBeSelected(role, employee.roleId);

	if (!actor) {
		const nextOabNumber = normalizeNullableString(input.oabNumber);

		await prisma.employee.update({
			where: { id: input.id },
			data: {
				fullName: input.fullName,
				email: input.email,
				typeId: type.id,
				roleId: role.id,
				oabNumber: nextOabNumber,
				remunerationPercentage: input.remunerationPercent,
				referralPercentage: input.referrerPercent,
				isActive: input.isActive,
			},
		});

		return { success: true };
	}

	await prisma.$transaction(async (tx) => {
		const authUser = await tx.user.findFirst({
			where: {
				employeeId: input.id,
			},
			select: {
				id: true,
				isAccessEnabled: true,
			},
		});
		const emailChanged = employee.email !== input.email;
		const nextOabNumber = normalizeNullableString(input.oabNumber);
		const oabChanged =
			normalizeNullableString(employee.oabNumber) !== nextOabNumber;
		const shouldRevokeAccess = emailChanged;

		await tx.employee.update({
			where: { id: input.id },
			data: {
				fullName: input.fullName,
				email: input.email,
				typeId: type.id,
				roleId: role.id,
				oabNumber: nextOabNumber,
				remunerationPercentage: input.remunerationPercent,
				referralPercentage: input.referrerPercent,
				isActive: input.isActive,
			},
		});

		if (authUser) {
			await tx.user.update({
				where: {
					id: authUser.id,
				},
				data: {
					name: input.fullName,
					email: input.email,
					isAccessEnabled: shouldRevokeAccess
						? false
						: authUser.isAccessEnabled,
				},
			});

			if (shouldRevokeAccess) {
				await tx.session.deleteMany({
					where: {
						userId: authUser.id,
					},
				});
			}
		}

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Employee",
			entityId: input.id,
			entityName: input.fullName,
			changeData: {
				before: employee,
				after: input,
				authAccessRevoked: shouldRevokeAccess,
				loginIdentifierChanged: emailChanged || oabChanged,
			},
			description: `Updated employee ${input.fullName}.`,
		});
	});

	return { success: true };
}

export async function deleteEmployee({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id });
	if (employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	const activeDependencyCount = await prisma.contractEmployee.count({
		where: {
			firmId,
			employeeId: id,
			deletedAt: null,
			remunerations: {
				some: {
					deletedAt: null,
				},
			},
		},
	});

	if (activeDependencyCount > 0) {
		throw new Error(EMPLOYEE_ERRORS.DELETE_ACTIVE_DEPENDENCIES);
	}

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "DELETE",
			entityType: "Employee",
			entityId: id,
			entityName: employee.fullName,
			changeData: { before: employee },
			description: `Deleted employee ${employee.fullName}.`,
		});
	});

	return { success: true };
}

export async function restoreEmployee({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id });
	if (!employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: { id },
			data: { deletedAt: null },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "RESTORE",
			entityType: "Employee",
			entityId: id,
			entityName: employee.fullName,
			changeData: { before: employee },
			description: `Restored employee ${employee.fullName}.`,
		});
	});

	return { success: true };
}

export async function resetEmployeePassword({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<ResetEmployeePasswordReturnType> {
	const employee = await getEmployeeById({ firmId, id });

	if (employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	const authUser = await prisma.user.findFirst({
		where: {
			employeeId: id,
			isAccessEnabled: true,
			employee: {
				firmId,
			},
			accounts: {
				some: {
					providerId: "credential",
				},
			},
		},
		select: {
			id: true,
			accounts: {
				where: {
					providerId: "credential",
				},
				select: {
					id: true,
				},
				take: 1,
			},
		},
	});

	if (!authUser?.accounts[0]) {
		throw new Error(EMPLOYEE_ERRORS.RESET_PASSWORD_UNAVAILABLE);
	}

	const temporaryPassword = createTemporaryPassword();
	const passwordHash = await hashPassword(temporaryPassword);

	await prisma.$transaction(async (tx) => {
		await tx.account.update({
			where: {
				id: authUser.accounts[0].id,
			},
			data: {
				password: passwordHash,
			},
		});

		await tx.user.update({
			where: {
				id: authUser.id,
			},
			data: {
				mustChangePassword: true,
			},
		});

		await tx.session.deleteMany({
			where: {
				userId: authUser.id,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Employee",
			entityId: id,
			entityName: employee.fullName,
			changeData: {
				action: "RESET_PASSWORD",
				mustChangePassword: true,
			},
			description: `Reset password for employee ${employee.fullName}.`,
		});
	});

	return {
		success: true,
		temporaryPassword,
	};
}

export async function grantEmployeeAccess({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<GrantEmployeeAccessReturnType> {
	const employee = await getEmployeeById({ firmId, id });

	if (employee.isSoftDeleted || !employee.isActive) {
		throw new Error(EMPLOYEE_ERRORS.GRANT_ACCESS_INACTIVE_EMPLOYEE);
	}

	const authUser = await prisma.user.findFirst({
		where: {
			OR: [{ employeeId: id }, { email: employee.email }],
		},
		select: {
			id: true,
			isAccessEnabled: true,
			accounts: {
				where: {
					providerId: "credential",
				},
				select: {
					id: true,
				},
				take: 1,
			},
		},
	});

	if (authUser?.isAccessEnabled && authUser.accounts[0]) {
		throw new Error(EMPLOYEE_ERRORS.GRANT_ACCESS_ALREADY_ENABLED);
	}

	const temporaryPassword = createTemporaryPassword();
	const passwordHash = await hashPassword(temporaryPassword);

	await prisma.$transaction(async (tx) => {
		const ensuredAuthUser = authUser
			? await tx.user.update({
					where: {
						id: authUser.id,
					},
					data: {
						name: employee.fullName,
						email: employee.email,
						emailVerified: true,
						employeeId: id,
						isAccessEnabled: true,
						mustChangePassword: true,
					},
					select: {
						id: true,
					},
				})
			: await tx.user.create({
					data: {
						id: randomUUID(),
						name: employee.fullName,
						email: employee.email,
						emailVerified: true,
						employeeId: id,
						isAccessEnabled: true,
						mustChangePassword: true,
					},
					select: {
						id: true,
					},
				});

		await createOrUpdateCredentialAccount({
			tx,
			authUserId: ensuredAuthUser.id,
			accountId: authUser?.accounts[0]?.id,
			passwordHash,
		});

		await tx.session.deleteMany({
			where: {
				userId: ensuredAuthUser.id,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Employee",
			entityId: id,
			entityName: employee.fullName,
			changeData: {
				action: "GRANT_ACCESS",
				isAccessEnabled: true,
				mustChangePassword: true,
			},
			description: `Granted system access to employee ${employee.fullName}.`,
		});
	});

	return {
		success: true,
		temporaryPassword,
	};
}

export async function revokeEmployeeAccess({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id });

	const authUser = await prisma.user.findFirst({
		where: {
			employeeId: id,
			employee: {
				firmId,
			},
			isAccessEnabled: true,
		},
		select: {
			id: true,
		},
	});

	if (!authUser) {
		throw new Error(EMPLOYEE_ERRORS.REVOKE_ACCESS_UNAVAILABLE);
	}

	await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: {
				id: authUser.id,
			},
			data: {
				isAccessEnabled: false,
			},
		});

		await tx.session.deleteMany({
			where: {
				userId: authUser.id,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Employee",
			entityId: id,
			entityName: employee.fullName,
			changeData: {
				action: "REVOKE_ACCESS",
				isAccessEnabled: false,
			},
			description: `Revoked system access from employee ${employee.fullName}.`,
		});
	});

	return { success: true };
}
