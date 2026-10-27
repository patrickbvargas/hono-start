import {
	type AuditLogActor,
	buildAuditUpdateChangeData,
	createAuditLog,
} from "@/features/audit-logs/data/mutations";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import type {
	EntityInputParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import { assertTypeCanBeSelected, assertTypeExists } from "../rules/lookups";
import type { EmployeeCreateInput, EmployeeUpdateInput } from "../schemas/form";

import { getEmployeeById, getEmployeeTypeByValue } from "./queries";

function normalizeNullableString(value: string | null | undefined) {
	return value?.trim() || null;
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
	const type = await getEmployeeTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type);

	await prisma.$transaction(async (tx) => {
		const employee = await tx.employee.create({
			data: {
				fullName: input.fullName,
				typeId: type.id,
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
			description: `Criou colaborador ${employee.fullName}.`,
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

	const type = await getEmployeeTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type, employee.typeId);

	const nextOabNumber = normalizeNullableString(input.oabNumber);

	const updateData = {
		fullName: input.fullName,
		isActive: input.isActive,
		oabNumber: nextOabNumber,
		referralPercentage: input.referrerPercent,
		remunerationPercentage: input.remunerationPercent,
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
				},
			}),
			description: `Atualizou colaborador ${input.fullName}.`,
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
			description: `Excluiu colaborador ${employee.fullName}.`,
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
			description: `Restaurou colaborador ${employee.fullName}.`,
		});
	});

	return { success: true };
}
