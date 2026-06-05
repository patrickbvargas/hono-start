import { randomInt } from "node:crypto";
import {
	type AuditLogActor,
	buildAuditUpdateChangeData,
	createAuditLog,
} from "@/features/audit-logs/data/mutations";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { getSupabaseAdminClient } from "@/shared/lib/supabase-admin";
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

function normalizeNullableString(value: string | null | undefined) {
	return value?.trim() || null;
}

async function findSupabaseAuthUserByEmail(email: string) {
	const admin = getSupabaseAdminClient();
	let page = 1;

	while (true) {
		const { data, error } = await admin.auth.admin.listUsers({
			page,
			perPage: 200,
		});

		if (error) {
			throw error;
		}

		const matchedUser = data.users.find((user) => user.email === email);

		if (matchedUser) {
			return matchedUser;
		}

		if (!data.nextPage) {
			return null;
		}

		page = data.nextPage;
	}
}

async function ensureSupabaseAuthUser(params: {
	email: string;
	fullName: string;
	authUserId: string | null;
	temporaryPassword: string;
}) {
	const admin = getSupabaseAdminClient();

	if (params.authUserId) {
		const { data, error } = await admin.auth.admin.updateUserById(
			params.authUserId,
			{
				email: params.email,
				email_confirm: true,
				password: params.temporaryPassword,
				user_metadata: {
					fullName: params.fullName,
				},
			},
		);

		if (error || !data.user) {
			throw error ?? new Error("Supabase Auth user update failed.");
		}

		return data.user.id;
	}

	const existingUser = await findSupabaseAuthUserByEmail(params.email);

	if (existingUser) {
		const { data, error } = await admin.auth.admin.updateUserById(
			existingUser.id,
			{
				email: params.email,
				email_confirm: true,
				password: params.temporaryPassword,
				user_metadata: {
					fullName: params.fullName,
				},
			},
		);

		if (error || !data.user) {
			throw error ?? new Error("Supabase Auth user relink failed.");
		}

		return data.user.id;
	}

	const { data, error } = await admin.auth.admin.createUser({
		email: params.email,
		email_confirm: true,
		password: params.temporaryPassword,
		user_metadata: {
			fullName: params.fullName,
		},
	});

	if (error || !data.user) {
		throw error ?? new Error("Supabase Auth user creation failed.");
	}

	return data.user.id;
}

async function createEmployeeAuditLog(
	tx: Prisma.TransactionClient,
	params: Parameters<typeof createAuditLog>[1],
) {
	await createAuditLog(tx, params);
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

		await createEmployeeAuditLog(tx, {
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

	const nextOabNumber = normalizeNullableString(input.oabNumber);
	const emailChanged = employee.email !== input.email;
	const oabChanged =
		normalizeNullableString(employee.oabNumber) !== nextOabNumber;
	const shouldRevokeAccess = emailChanged && employee.isAccessEnabled;

	const updateData = {
		email: input.email,
		fullName: input.fullName,
		isAccessEnabled: shouldRevokeAccess ? false : employee.isAccessEnabled,
		isActive: input.isActive,
		mustChangePassword: shouldRevokeAccess ? true : employee.mustChangePassword,
		oabNumber: nextOabNumber,
		referralPercentage: input.referrerPercent,
		remunerationPercentage: input.remunerationPercent,
		roleId: role.id,
		typeId: type.id,
	};

	if (!actor) {
		await prisma.employee.update({
			where: {
				id: input.id,
			},
			data: updateData,
		});

		return { success: true };
	}

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: {
				id: input.id,
			},
			data: updateData,
		});

		await createEmployeeAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Employee",
			entityId: input.id,
			entityName: input.fullName,
			changeData: buildAuditUpdateChangeData({
				before: employee,
				after: {
					...input,
					authAccessRevoked: shouldRevokeAccess,
					loginIdentifierChanged: emailChanged || oabChanged,
				},
			}),
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
			deletedAt: null,
			employeeId: id,
			firmId,
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

		await createEmployeeAuditLog(tx, {
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

		await createEmployeeAuditLog(tx, {
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

	if (!employee.hasCredentialAccount || !employee.isAccessEnabled) {
		throw new Error(EMPLOYEE_ERRORS.RESET_PASSWORD_UNAVAILABLE);
	}

	if (!employee.authUserId) {
		throw new Error(EMPLOYEE_ERRORS.RESET_PASSWORD_UNAVAILABLE);
	}

	const temporaryPassword = createTemporaryPassword();
	const admin = getSupabaseAdminClient();
	const { error } = await admin.auth.admin.updateUserById(employee.authUserId, {
		email: employee.email,
		email_confirm: true,
		password: temporaryPassword,
	});

	if (error) {
		throw error;
	}

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: {
				id,
			},
			data: {
				mustChangePassword: true,
			},
		});

		await createEmployeeAuditLog(tx, {
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

	if (employee.hasCredentialAccount && employee.isAccessEnabled) {
		throw new Error(EMPLOYEE_ERRORS.GRANT_ACCESS_ALREADY_ENABLED);
	}

	const temporaryPassword = createTemporaryPassword();
	const authUserId = await ensureSupabaseAuthUser({
		email: employee.email,
		fullName: employee.fullName,
		authUserId: employee.authUserId,
		temporaryPassword,
	});

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: {
				id,
			},
			data: {
				isAccessEnabled: true,
				mustChangePassword: true,
				authUserId,
			},
		});

		await createEmployeeAuditLog(tx, {
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

	if (!employee.hasCredentialAccount || !employee.isAccessEnabled) {
		throw new Error(EMPLOYEE_ERRORS.REVOKE_ACCESS_UNAVAILABLE);
	}

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: {
				id,
			},
			data: {
				isAccessEnabled: false,
			},
		});

		await createEmployeeAuditLog(tx, {
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
