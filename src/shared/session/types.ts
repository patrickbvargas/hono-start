export const SESSION_ADMIN_ROLE_VALUE = "ADMIN" as const;
export const SESSION_USER_ROLE_VALUE = "USER" as const;
export const SESSION_EMPLOYEE_TYPE_LAWYER_VALUE = "LAWYER" as const;
export const SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE =
	"ADMIN_ASSISTANT" as const;
export const SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE = "RESPONSIBLE" as const;
export const SESSION_ASSIGNMENT_TYPE_RECOMMENDING_VALUE =
	"RECOMMENDING" as const;
export const SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE = "RECOMMENDED" as const;
export const SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE =
	"ADMIN_ASSISTANT" as const;
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

export interface SessionAssignmentSummary {
	assignmentTypeValue: string;
	employeeId: number;
	employeeTypeValue: string;
}

export interface ContractAccessResource extends SessionFirmResource {
	assignedEmployeeIds?: number[];
	assignments?: SessionAssignmentSummary[];
	isAssignedToActor?: boolean;
	statusValue?: string;
	allowStatusChange?: boolean;
}

export interface FeeAccessResource extends SessionFirmResource {
	assignedEmployeeIds?: number[];
	assignments?: SessionAssignmentSummary[];
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
