import {
	type AttachmentAccessResource,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
	type ContractAccessResource,
	type EmployeeAccessResource,
	type FeeAccessResource,
	type LoggedUserSession,
	type SessionAction,
	type SessionResource,
} from "./model";
import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	isAdminSession,
} from "./selectors";

function isSameFirm(
	session: LoggedUserSession,
	resource?: { firmId: number } | null,
) {
	if (!resource) {
		return true;
	}

	return resource.firmId === getCurrentFirmId(session);
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

	return (
		resource.assignedEmployeeIds?.includes(getCurrentEmployeeId(session)) ??
		false
	);
}

function isContractReadOnly(resource?: ContractAccessResource | null) {
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

function canAccessOwnEmployee(
	session: LoggedUserSession,
	resource?: EmployeeAccessResource | null,
) {
	if (!resource) {
		return false;
	}

	return (
		isSameFirm(session, resource) &&
		resource.employeeId === getCurrentEmployeeId(session)
	);
}

export function can(
	session: LoggedUserSession,
	action: SessionAction,
	resource?: SessionResource,
) {
	if (!isSameFirm(session, resource)) {
		return false;
	}

	if (isAdminSession(session)) {
		return true;
	}

	switch (action) {
		case "attachment.view":
		case "attachment.upload":
		case "client.create":
		case "client.update":
		case "dashboard.view":
			return true;
		case "employee.manage":
		case "client.delete":
		case "client.restore":
		case "contract.delete":
		case "contract.restore":
		case "attachment.delete":
		case "audit-log.view":
			return false;
		case "employee.update":
			return canAccessOwnEmployee(session, resource as EmployeeAccessResource);
		case "contract.view":
		case "fee.view":
			return isAssignedToActor(
				session,
				resource as ContractAccessResource | FeeAccessResource,
			);
		case "contract.create":
			return true;
		case "contract.assign-employee":
		case "contract.update":
			return (
				isAssignedToActor(session, resource as ContractAccessResource) &&
				!isContractReadOnly(resource as ContractAccessResource)
			);
	}
}

export function assertCan(
	session: LoggedUserSession,
	action: SessionAction,
	resource?: SessionResource,
) {
	if (can(session, action, resource)) {
		return;
	}

	const errorMessages: Record<SessionAction, string> = {
		"attachment.delete": "Apenas administradores podem excluir anexos",
		"attachment.upload": "Você não tem permissão para enviar anexos",
		"attachment.view": "Você não tem permissão para visualizar este anexo",
		"audit-log.view": "Apenas administradores podem visualizar o audit log",
		"client.create": "Você não tem permissão para criar clientes",
		"client.delete": "Apenas administradores podem excluir clientes",
		"client.restore": "Apenas administradores podem restaurar clientes",
		"client.update": "Você não tem permissão para editar clientes",
		"contract.assign-employee":
			"Você não tem permissão para alterar a equipe deste contrato",
		"contract.create": "Você não tem permissão para criar contratos",
		"contract.delete": "Apenas administradores podem excluir contratos",
		"contract.restore": "Apenas administradores podem restaurar contratos",
		"contract.update": "Você não tem permissão para editar este contrato",
		"contract.view": "Você não tem permissão para visualizar este contrato",
		"dashboard.view": "Você não tem permissão para visualizar o dashboard",
		"employee.manage": "Apenas administradores podem gerenciar funcionários",
		"employee.update": "Você não tem permissão para editar este funcionário",
		"fee.view": "Você não tem permissão para visualizar estes honorários",
	};

	throw new Error(errorMessages[action]);
}

export function canManageEmployees(session: LoggedUserSession) {
	return can(session, "employee.manage");
}

export function canUpdateEmployee(
	session: LoggedUserSession,
	resource: EmployeeAccessResource,
) {
	return can(session, "employee.update", resource);
}

export function canCreateContract(session: LoggedUserSession) {
	return can(session, "contract.create");
}

export function canViewContract(
	session: LoggedUserSession,
	resource: ContractAccessResource,
) {
	return can(session, "contract.view", resource);
}

export function canUpdateContract(
	session: LoggedUserSession,
	resource: ContractAccessResource,
) {
	return can(session, "contract.update", resource);
}

export function canDeleteContract(
	session: LoggedUserSession,
	resource: ContractAccessResource,
) {
	return can(session, "contract.delete", resource);
}

export function canViewFee(
	session: LoggedUserSession,
	resource: FeeAccessResource,
) {
	return can(session, "fee.view", resource);
}

export function canDeleteAttachment(
	session: LoggedUserSession,
	resource: AttachmentAccessResource,
) {
	return can(session, "attachment.delete", resource);
}

export function assertCanManageEmployees(session: LoggedUserSession) {
	assertCan(session, "employee.manage");
}
