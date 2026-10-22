import type { ClerkPermission } from "./schema";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
	type ContractAccessResource,
	type FeeAccessResource,
	type LoggedUserSession,
	type RemunerationAccessResource,
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
	resource?: ContractAccessResource | FeeAccessResource | null,
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

export function isContractReadOnly(
	resource?: ContractAccessResource | FeeAccessResource | null,
) {
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

export function isContractWritable(
	resource?: ContractAccessResource | FeeAccessResource | null,
) {
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
		key === "org:contracts:read_assigned" ||
		key === "org:fees:read_assigned"
	) {
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
	if (key === "org:fees:create" || key === "org:fees:update") {
		return (
			isContractWritable(resource as FeeAccessResource) &&
			(hasPermission(session, "org:fees:read_all") ||
				(hasPermission(session, "org:fees:read_assigned") &&
					isAssignedToActor(session, resource as FeeAccessResource)))
		);
	}
	if (
		key === "org:remunerations:read_own" ||
		key === "org:remunerations:export_own"
	) {
		return (
			!resource ||
			(resource as RemunerationAccessResource).employeeId ===
				session.employee.id
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
		case "attachment":
		case "audit-log":
		case "client":
		case "dashboard":
		case "expense":
		case "employee":
			return { firmId: session.firm.id };
		case "contract":
		case "fee":
		case "remuneration":
			if (
				hasPermission(
					session,
					subject === "contract"
						? "org:contracts:read_all"
						: subject === "fee"
							? "org:fees:read_all"
							: "org:remunerations:read_all",
				)
			) {
				return { firmId: session.firm.id };
			}

			return {
				firmId: session.firm.id,
				employeeId: getCurrentEmployeeId(session),
			};
	}
}
