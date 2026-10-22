import { clerkClient } from "@clerk/tanstack-react-start/server";
import {
	type AuditLogActor,
	buildAuditUpdateChangeData,
	createAuditLog,
} from "@/features/audit-logs/data/mutations";
import type { Prisma } from "@/generated/prisma/client";
import { env } from "@/shared/config/env";
import { prisma } from "@/shared/lib/prisma";
import { getRequiredServerLoggedUserSession } from "@/shared/session/server";
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
	assertAssignableClerkRole,
	getEmployeeClerkAccess,
} from "./clerk-access";
import {
	getEmployeeById,
	getEmployeeTypeByValue,
	getUserRoleByValue,
} from "./queries";

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
	const [type, role] = await Promise.all([
		getEmployeeTypeByValue(input.type),
		getUserRoleByValue("USER"),
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
		getUserRoleByValue("USER"),
	]);

	assertTypeExists(type);
	assertRoleExists(role);
	assertTypeCanBeSelected(type, employee.typeId);
	assertRoleCanBeSelected(role, employee.roleId);

	const nextOabNumber = normalizeNullableString(input.oabNumber);
	const emailChanged = employee.email !== input.email;
	const oabChanged =
		normalizeNullableString(employee.oabNumber) !== nextOabNumber;
	const accessState = await getEmployeeClerkAccess(
		firmId,
		(await prisma.employee.findUniqueOrThrow({ where: { id: input.id } }))
			.clerkUserId,
	);
	const shouldRevokeAccess = emailChanged && accessState.isAccessActive;
	if (shouldRevokeAccess) {
		await revokeEmployeeAccess({ firmId, id: input.id, actor });
	}

	const updateData = {
		email: input.email,
		fullName: input.fullName,
		isActive: input.isActive,
		mustChangePassword: false,
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

export async function grantEmployeeAccess({
	actor,
	firmId,
	id,
	role,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
	role: string;
}): Promise<MutationReturnType> {
	const session = await getRequiredServerLoggedUserSession();
	const employee = await prisma.employee.findFirstOrThrow({
		where: { id, firmId, isActive: true, deletedAt: null },
		include: { firm: true },
	});
	if (!employee.firm.clerkOrganizationId || session.firm.id !== firmId) {
		throw new Error(EMPLOYEE_ERRORS.GRANT_ACCESS_FAILED);
	}
	await assertAssignableClerkRole(session, role);
	const client = clerkClient();
	let userId = employee.clerkUserId;
	if (!userId) {
		const existing = await client.users.getUserList({
			externalId: [`hono:employee:${id}`],
			limit: 2,
		});
		if (existing.data.length > 1) {
			throw new Error(EMPLOYEE_ERRORS.GRANT_ACCESS_FAILED);
		}
		const user =
			existing.data[0] ??
			(await client.users.createUser({
				emailAddress: [employee.email],
				externalId: `hono:employee:${id}`,
				skipPasswordRequirement: true,
			}));
		userId = user.id;
		// Persist mapping before invitation. A partial write never grants product access.
		await prisma.employee.update({
			where: { id },
			data: { clerkUserId: userId },
		});
	}
	const linkedUser = await client.users.getUser(userId);
	const state = await getEmployeeClerkAccess(firmId, userId);
	if (
		!state.isAccessActive &&
		!linkedUser.emailAddresses.some(
			(address) =>
				address.emailAddress.toLowerCase() === employee.email.toLowerCase(),
		)
	) {
		throw new Error(
			"E-mail alterado: reconcilie o vínculo verificado no Clerk antes de conceder acesso.",
		);
	}
	if (state.isAccessActive) {
		await client.organizations.updateOrganizationMembership({
			organizationId: employee.firm.clerkOrganizationId,
			userId,
			role,
		});
	} else {
		const invitations =
			await client.organizations.getOrganizationInvitationList({
				organizationId: employee.firm.clerkOrganizationId,
				status: ["pending"],
				limit: 100,
			});
		const invitation = invitations.data.find(
			(item) =>
				item.emailAddress.toLowerCase() === employee.email.toLowerCase(),
		);
		if (invitation && invitation.role !== role) {
			throw new Error("Revogue o convite pendente antes de alterar o perfil.");
		}
		if (!invitation) {
			await client.organizations.createOrganizationInvitation({
				organizationId: employee.firm.clerkOrganizationId,
				emailAddress: employee.email,
				role,
				redirectUrl: new URL("/convite", env.APP_URL).href,
				inviterUserId: session.clerk?.userId,
			});
		}
	}
	await createAuditLog(prisma, {
		firmId,
		actor,
		action: "UPDATE",
		entityType: "Employee",
		entityId: id,
		entityName: employee.fullName,
		changeData: { action: "CLERK_INVITATION", role },
		description: `Requested Clerk access for employee ${id}.`,
	});
	return { success: true };
}

export async function revokeEmployeeAccess({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const employee = await prisma.employee.findFirstOrThrow({
		where: { id, firmId },
		include: { firm: true },
	});
	if (!employee.firm.clerkOrganizationId) {
		throw new Error(EMPLOYEE_ERRORS.REVOKE_ACCESS_UNAVAILABLE);
	}
	const client = clerkClient();
	const state = await getEmployeeClerkAccess(firmId, employee.clerkUserId);
	if (employee.clerkUserId && state.isAccessActive) {
		await client.organizations.deleteOrganizationMembership({
			organizationId: employee.firm.clerkOrganizationId,
			userId: employee.clerkUserId,
		});
	}
	const invitations = await client.organizations.getOrganizationInvitationList({
		organizationId: employee.firm.clerkOrganizationId,
		status: ["pending"],
		limit: 100,
	});
	for (const invitation of invitations.data.filter(
		(item) => item.emailAddress.toLowerCase() === employee.email.toLowerCase(),
	)) {
		await client.organizations.revokeOrganizationInvitation({
			organizationId: employee.firm.clerkOrganizationId,
			invitationId: invitation.id,
		});
	}
	await createAuditLog(prisma, {
		firmId,
		actor,
		action: "UPDATE",
		entityType: "Employee",
		entityId: id,
		entityName: employee.fullName,
		changeData: { action: "REVOKE_CLERK_MEMBERSHIP" },
		description: `Revoked Clerk membership for employee ${id}.`,
	});
	return { success: true };
}

export async function restoreEmployeeAccess(
	params: EntityUniqueParams & { actor?: AuditLogActor; role: string },
): Promise<MutationReturnType> {
	return grantEmployeeAccess(params);
}
