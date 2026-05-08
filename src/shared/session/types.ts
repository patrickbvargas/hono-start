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
	mustChangePassword: boolean;
}

export type SessionScopeSubject =
	| "employee"
	| "client"
	| "contract"
	| "fee"
	| "remuneration"
	| "attachment"
	| "dashboard"
	| "audit-log";

interface SessionFirmResource {
	firmId: number;
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

export interface RemunerationAccessResource extends SessionFirmResource {
	employeeId: number;
}

export interface AttachmentAccessResource extends SessionFirmResource {}

export interface DashboardAccessResource extends SessionFirmResource {}

export interface AuditLogAccessResource extends SessionFirmResource {}

export type SessionResource =
	| AttachmentAccessResource
	| AuditLogAccessResource
	| ContractAccessResource
	| DashboardAccessResource
	| FeeAccessResource
	| RemunerationAccessResource
	| null
	| undefined;

export interface SessionScope {
	firmId: number;
	employeeId?: number;
}
