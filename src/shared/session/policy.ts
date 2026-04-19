import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
	type ContractAccessResource,
	type EmployeeAccessResource,
	type FeeAccessResource,
	type LoggedUserSession,
	type RemunerationAccessResource,
	type SessionAction,
	type SessionResource,
} from "./model";
import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	isAdminSession,
} from "./selectors";

const AUTHENTICATED_ACTIONS = new Set<SessionAction>([
	"attachment.view",
	"attachment.upload",
	"client.create",
	"client.update",
	"contract.create",
	"dashboard.view",
]);

const ADMIN_ONLY_ACTIONS = new Set<SessionAction>([
	"attachment.delete",
	"audit-log.view",
	"client.delete",
	"client.restore",
	"contract.delete",
	"contract.restore",
	"employee.manage",
	"fee.delete",
	"fee.restore",
	"remuneration.delete",
	"remuneration.restore",
	"remuneration.update",
]);

const OWN_EMPLOYEE_ACTIONS = new Set<SessionAction>(["employee.update"]);

const ASSIGNED_RESOURCE_READ_ACTIONS = new Set<SessionAction>([
	"contract.view",
	"fee.view",
]);

const ASSIGNED_CONTRACT_WRITE_ACTIONS = new Set<SessionAction>([
	"contract.assign-employee",
	"contract.update",
]);

const ASSIGNED_FEE_WRITE_ACTIONS = new Set<SessionAction>([
	"fee.create",
	"fee.update",
]);

const OWN_REMUNERATION_ACTIONS = new Set<SessionAction>([
	"remuneration.export",
	"remuneration.view",
]);

const ERROR_MESSAGES: Record<SessionAction, string> = {
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
	"fee.create": "Você não tem permissão para criar honorários",
	"fee.delete": "Apenas administradores podem excluir honorários",
	"fee.restore": "Apenas administradores podem restaurar honorários",
	"fee.update": "Você não tem permissão para editar este honorário",
	"fee.view": "Você não tem permissão para visualizar estes honorários",
	"remuneration.delete": "Apenas administradores podem excluir remunerações",
	"remuneration.export":
		"Você não tem permissão para exportar estas remunerações",
	"remuneration.restore": "Apenas administradores podem restaurar remunerações",
	"remuneration.update": "Apenas administradores podem editar remunerações",
	"remuneration.view":
		"Você não tem permissão para visualizar esta remuneração",
};

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

function canAccessOwnRemuneration(
	session: LoggedUserSession,
	resource?: RemunerationAccessResource | null,
) {
	if (!resource) {
		return true;
	}

	return (
		isSameFirm(session, resource) &&
		resource.employeeId === getCurrentEmployeeId(session)
	);
}

export function isContractWritable(
	resource?: ContractAccessResource | FeeAccessResource | null,
) {
	if (!resource) {
		return false;
	}

	return !isContractReadOnly(resource);
}

function canAccessAssignedWritableContract(
	session: LoggedUserSession,
	resource?: ContractAccessResource | null,
) {
	return isAssignedToActor(session, resource) && isContractWritable(resource);
}

function canAccessAssignedWritableFee(
	session: LoggedUserSession,
	resource?: FeeAccessResource | null,
) {
	return isAssignedToActor(session, resource) && isContractWritable(resource);
}

function canRegularUser(
	session: LoggedUserSession,
	action: SessionAction,
	resource?: SessionResource,
) {
	if (AUTHENTICATED_ACTIONS.has(action)) {
		return true;
	}

	if (ADMIN_ONLY_ACTIONS.has(action)) {
		return false;
	}

	if (OWN_EMPLOYEE_ACTIONS.has(action)) {
		return canAccessOwnEmployee(session, resource as EmployeeAccessResource);
	}

	if (ASSIGNED_RESOURCE_READ_ACTIONS.has(action)) {
		return isAssignedToActor(
			session,
			resource as ContractAccessResource | FeeAccessResource,
		);
	}

	if (ASSIGNED_CONTRACT_WRITE_ACTIONS.has(action)) {
		return canAccessAssignedWritableContract(
			session,
			resource as ContractAccessResource,
		);
	}

	if (ASSIGNED_FEE_WRITE_ACTIONS.has(action)) {
		return canAccessAssignedWritableFee(session, resource as FeeAccessResource);
	}

	if (OWN_REMUNERATION_ACTIONS.has(action)) {
		return canAccessOwnRemuneration(
			session,
			resource as RemunerationAccessResource,
		);
	}

	return false;
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

	return canRegularUser(session, action, resource);
}

export function assertCan(
	session: LoggedUserSession,
	action: SessionAction,
	resource?: SessionResource,
) {
	if (can(session, action, resource)) {
		return;
	}

	throw new Error(ERROR_MESSAGES[action]);
}
