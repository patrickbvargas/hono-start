import { prisma } from "@/shared/lib/prisma";
import type {
	ContractAccessResource,
	LoggedUserSession,
} from "@/shared/session";
import { assertCan, getServerScope, isAdminSession } from "@/shared/session";
import { CONTRACT_ERRORS } from "../constants/errors";

export async function getContractAccessResourceById(id: number) {
	const scope = getServerScope("contract");
	const contract = await prisma.contract.findFirst({
		where: { id, firmId: scope.firmId },
		include: {
			status: { select: { value: true } },
			assignments: {
				where: { deletedAt: null, isActive: true },
				select: { employeeId: true },
			},
			revenues: {
				where: { deletedAt: null, isActive: true },
				select: { id: true },
			},
		},
	});

	if (!contract) {
		return null;
	}

	return {
		id: contract.id,
		resource: {
			firmId: contract.firmId,
			statusValue: contract.status.value,
			allowStatusChange: contract.allowStatusChange,
			assignedEmployeeIds: contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		} satisfies ContractAccessResource,
		hasActiveRevenues: contract.revenues.length > 0,
	};
}

export async function requireContractAccessResourceById(id: number) {
	const contract = await getContractAccessResourceById(id);

	if (!contract) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	}

	return contract;
}

export async function assertCanAccessContractById(
	session: LoggedUserSession,
	action:
		| "contract.view"
		| "contract.update"
		| "contract.delete"
		| "contract.restore",
	id: number,
) {
	const contract = await requireContractAccessResourceById(id);
	assertCan(session, action, contract.resource);
	return contract;
}

export function canActorControlContractStatus(session: LoggedUserSession) {
	return isAdminSession(session);
}
