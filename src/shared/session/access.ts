import { type SessionAction, sessionActionPolicies } from "./permissions";
import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	isAdminSession,
} from "./selectors";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
	type ContractAccessResource,
	type FeeAccessResource,
	type LoggedUserSession,
	type RemunerationAccessResource,
	type SessionResource,
} from "./types";

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

export function isContractWritable(
	resource?: ContractAccessResource | FeeAccessResource | null,
) {
	if (!resource) {
		return false;
	}

	return !isContractReadOnly(resource);
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
	const policy = sessionActionPolicies[action];

	switch (policy.kind) {
		case "authenticated":
			return true;
		case "admin-only":
			return false;
		case "assigned-read":
			return isAssignedToActor(
				session,
				resource as ContractAccessResource | FeeAccessResource,
			);
		case "assigned-contract-write":
			return canAccessAssignedWritableContract(
				session,
				resource as ContractAccessResource,
			);
		case "assigned-fee-write":
			return canAccessAssignedWritableFee(
				session,
				resource as FeeAccessResource,
			);
		case "own-remuneration":
			return canAccessOwnRemuneration(
				session,
				resource as RemunerationAccessResource,
			);
	}
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

	throw new Error(sessionActionPolicies[action].deniedMessage);
}
