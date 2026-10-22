export {
	assertCan,
	can,
	isContractReadOnly,
	isContractWritable,
} from "./access";
export { clearAuthenticatedQueryCache } from "./cache";
export type { ClerkPermission } from "./catalog";
export type { AuthenticatedServerFunctionContext } from "./middleware";
export {
	LoggedUserSessionProvider,
	useLoggedUserSession,
	useLoggedUserSessionStore,
	useOptionalLoggedUserSession,
} from "./provider";
export { getCurrentSessionQueryOptions, sessionKeys } from "./query";
export {
	FORCED_PASSWORD_CHANGE_PATH,
	getAuthenticatedHomePath,
	getRouteSession,
	getSafeInternalRedirectPath,
	requireRouteSession,
} from "./route";
export { getScope } from "./scope";
export {
	getCurrentEmployeeId,
	getCurrentFirmId,
	hasPermission,
} from "./selectors";
export {
	CONTRACT_STATUS_ACTIVE_VALUE,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
	type ContractAccessResource,
	type FeeAccessResource,
	type LoggedUserSession,
	type RemunerationAccessResource,
	SESSION_ADMIN_ROLE_VALUE,
	SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	SESSION_ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_EMPLOYEE_TYPE_LAWYER_VALUE,
	SESSION_USER_ROLE_VALUE,
	type SessionAssignmentSummary,
	type SessionResource,
	type SessionScope,
	type SessionScopeSubject,
} from "./types";
