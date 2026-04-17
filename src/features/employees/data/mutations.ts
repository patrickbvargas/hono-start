import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import type {
	EntityInputParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import {
	assertLookupSelectionsAreActive,
	resolveEmployeeLookupSelections,
} from "../rules/lookups";
import type { EmployeeCreateInput, EmployeeUpdateInput } from "../schemas/form";
import { getEmployeeById } from "./queries";

export async function createEmployee({
	firmId,
	input,
}: EntityInputParams<EmployeeCreateInput>): Promise<MutationReturnType> {
	const { type, role } = await resolveEmployeeLookupSelections(prisma, input);

	assertLookupSelectionsAreActive({ type, role });

	await prisma.employee.create({
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

	return { success: true };
}

export async function updateEmployee({
	firmId,
	input,
}: EntityInputParams<EmployeeUpdateInput>): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id: input.id });
	if (employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	const { type, role } = await resolveEmployeeLookupSelections(prisma, input);

	assertLookupSelectionsAreActive(
		{ type, role },
		{ currentTypeId: employee.typeId, currentRoleId: employee.roleId },
	);

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

export async function deleteEmployee({
	firmId,
	id,
}: EntityUniqueParams): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id });
	if (employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	await prisma.employee.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { success: true };
}

export async function restoreEmployee({
	firmId,
	id,
}: EntityUniqueParams): Promise<MutationReturnType> {
	const employee = await getEmployeeById({ firmId, id });
	if (!employee.isSoftDeleted) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	await prisma.employee.update({
		where: { id },
		data: { deletedAt: null },
	});

	return { success: true };
}
