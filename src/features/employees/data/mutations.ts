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
