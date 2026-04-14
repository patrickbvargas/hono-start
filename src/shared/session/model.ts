export const SESSION_ADMIN_ROLE_VALUE = "ADMIN" as const;
export const SESSION_USER_ROLE_VALUE = "USER" as const;
export const CONTRACT_STATUS_ACTIVE_VALUE = "ACTIVE" as const;
export const CONTRACT_STATUS_CANCELLED_VALUE = "CANCELLED" as const;
export const CONTRACT_STATUS_COMPLETED_VALUE = "COMPLETED" as const;

export interface SessionIdentity {
	id: number;
	fullName: string;
	email: string;
}

export interface SessionEmployee {
	id: number;
}

export interface SessionFirm {
	id: number;
	name: string;
}

export interface SessionOption {
	id: number;
	value: string;
	label: string;
}

export interface LoggedUserSession {
	user: SessionIdentity;
	employee: SessionEmployee;
	firm: SessionFirm;
	employeeType: SessionOption;
	role: SessionOption;
}

export type SessionAction =
	| "employee.manage"
	| "employee.update"
	| "client.create"
	| "client.update"
	| "client.delete"
	| "client.restore"
	| "contract.view"
	| "contract.create"
	| "contract.update"
	| "contract.delete"
	| "contract.restore"
	| "contract.assign-employee"
	| "fee.create"
	| "fee.update"
	| "fee.view"
	| "fee.delete"
	| "fee.restore"
	| "attachment.view"
	| "attachment.upload"
	| "attachment.delete"
	| "dashboard.view"
	| "audit-log.view";

export type SessionScopeSubject =
	| "employee"
	| "client"
	| "contract"
	| "fee"
	| "attachment"
	| "dashboard"
	| "audit-log";

interface SessionFirmResource {
	firmId: number;
}

export interface EmployeeAccessResource extends SessionFirmResource {
	employeeId: number;
}

export interface ContractAccessResource extends SessionFirmResource {
	assignedEmployeeIds?: number[];
	isAssignedToActor?: boolean;
	statusValue?: string;
	allowStatusChange?: boolean;
}

export interface FeeAccessResource extends SessionFirmResource {
	assignedEmployeeIds?: number[];
	isAssignedToActor?: boolean;
	statusValue?: string;
	allowStatusChange?: boolean;
}

export interface AttachmentAccessResource extends SessionFirmResource {}

export interface DashboardAccessResource extends SessionFirmResource {}

export interface AuditLogAccessResource extends SessionFirmResource {}

export type SessionResource =
	| AttachmentAccessResource
	| AuditLogAccessResource
	| ContractAccessResource
	| DashboardAccessResource
	| EmployeeAccessResource
	| FeeAccessResource
	| null
	| undefined;

export interface SessionScope {
	firmId: number;
	employeeId?: number;
}
