import { randomInt } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
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
		await prisma.employee.update({
			where: { id: input.id },
			data: {
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

		return { success: true };
	}

	await prisma.$transaction(async (tx) => {
		await tx.employee.update({
			where: { id: input.id },
			data: {
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
			action: "UPDATE",
			entityType: "Employee",
			entityId: input.id,
			entityName: input.fullName,
			changeData: { before: employee, after: input },
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
