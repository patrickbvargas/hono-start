import type { ClerkPermission } from "./schema";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
	type ContractAccessResource,
	type FinancialAccessResource,
	type LoggedUserSession,
	SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_EMPLOYEE_TYPE_LAWYER_VALUE,
	type SessionResource,
	type SessionScope,
	type SessionScopeSubject,
} from "./schema";

function isSameFirm(
	session: LoggedUserSession,
	resource?: { firmId: number } | null,
) {
	if (!resource) {
		return true;
	}

	return resource.firmId === session.firm.id;
}

function isAssignedToActor(
	session: LoggedUserSession,
	resource?: ContractAccessResource | null,
) {
	if (!resource) {
		return false;
	}

	if (typeof resource.isAssignedToActor === "boolean") {
		return resource.isAssignedToActor;
	}

	if (resource.assignments) {
		return resource.assignments.some((assignment) => {
			if (assignment.employeeId !== getCurrentEmployeeId(session)) {
				return false;
			}

			if (
				session.employeeType?.value ===
				SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE
			) {
				return (
					assignment.employeeTypeValue ===
						SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE &&
					assignment.assignmentTypeValue ===
						SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE
				);
			}

			if (session.employeeType?.value === SESSION_EMPLOYEE_TYPE_LAWYER_VALUE) {
				const visibleLawyerAssignmentTypes: string[] = [
					SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
					SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
				];

				return (
					assignment.employeeTypeValue === SESSION_EMPLOYEE_TYPE_LAWYER_VALUE &&
					visibleLawyerAssignmentTypes.includes(assignment.assignmentTypeValue)
				);
			}

			return false;
		});
	}

	return (
		resource.assignedEmployeeIds?.includes(getCurrentEmployeeId(session)) ??
		false
	);
}

export function isContractReadOnly(resource?: ContractAccessResource | null) {
	if (!resource?.statusValue) {
		return false;
	}

	return (
		[
			CONTRACT_STATUS_CANCELLED_VALUE,
			CONTRACT_STATUS_COMPLETED_VALUE,
		] as string[]
	).includes(resource.statusValue);
}

export function isContractWritable(resource?: ContractAccessResource | null) {
	if (!resource) {
		return false;
	}

	return !isContractReadOnly(resource);
}

// Permission membership is checked directly; the rest enforces domain scope.
export function can(
	session: LoggedUserSession,
	permission: ClerkPermission | readonly ClerkPermission[],
	resource?: SessionResource,
): boolean {
	if (typeof permission !== "string") {
		return permission.some((key) => can(session, key, resource));
	}
	const key = permission;
	if (
		session.employee.id === null &&
		(key.endsWith("_own") || key.endsWith("_assigned"))
	) {
		return false;
	}
	if (!hasPermission(session, key) || !isSameFirm(session, resource))
		return false;

	if (
		key === "org:receivables:read_assigned" ||
		key === "org:receipts:read_assigned" ||
		key === "org:receipts:create"
	) {
		if (!resource) {
			return key !== "org:receipts:create";
		}
		const financial = resource as FinancialAccessResource;
		if (
			hasPermission(session, "org:receipts:read_all") &&
			key === "org:receipts:create"
		) {
			return true;
		}
		return (
			!!financial.contract &&
			financial.contract.firmId === session.firm.id &&
			isAssignedToActor(session, financial.contract)
		);
	}
	if (key === "org:payables:read_own" || key === "org:payments:read_own") {
		if (!resource) {
			return !!session.person;
		}
		const financial = resource as FinancialAccessResource;
		return (
			!!session.person &&
			financial.beneficiaryPersonId === session.person.id &&
			financial.isRemuneration === true &&
			!!financial.contract &&
			financial.contract.firmId === session.firm.id &&
			isAssignedToActor(session, financial.contract)
		);
	}
	if (key === "org:contracts:read_assigned") {
		return (
			!resource ||
			isAssignedToActor(session, resource as ContractAccessResource)
		);
	}
	if (
		key === "org:contracts:update_all" ||
		key === "org:contracts:update_assigned"
	) {
		return (
			isContractWritable(resource as ContractAccessResource) &&
			(key === "org:contracts:update_all" ||
				isAssignedToActor(session, resource as ContractAccessResource))
		);
	}
	return true;
}

export function assertCan(
	session: LoggedUserSession,
	permission: ClerkPermission | readonly ClerkPermission[],
	resource?: SessionResource,
) {
	if (!can(session, permission, resource)) {
		throw new Error("Você não tem permissão para esta operação.");
	}
}

export function getCurrentEmployeeId(session: LoggedUserSession) {
	if (session.employee.id === null) {
		throw new Error("Conta sem colaborador vinculado para esta operação.");
	}
	return session.employee.id;
}

export function hasPermission(
	session: Pick<LoggedUserSession, "permissions"> | null | undefined,
	permission: ClerkPermission,
) {
	return session?.permissions.includes(permission) ?? false;
}

export function getScope(
	session: LoggedUserSession,
	subject: SessionScopeSubject,
): SessionScope {
	switch (subject) {
		case "receivable":
			return hasPermission(session, "org:receivables:read_all")
				? { firmId: session.firm.id }
				: {
						firmId: session.firm.id,
						employeeId: getCurrentEmployeeId(session),
					};
		case "attachment":
		case "audit-log":
		case "client":
		case "dashboard":
		case "expense":
		case "employee":
			return { firmId: session.firm.id };
		case "contract":
			if (hasPermission(session, "org:contracts:read_all")) {
				return { firmId: session.firm.id };
			}

			return {
				firmId: session.firm.id,
				employeeId: getCurrentEmployeeId(session),
			};
	}
}
