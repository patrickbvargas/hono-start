import { hasPermission, type LoggedUserSession } from "@/shared/session";
import type { ContractDetail } from "../schemas/model";
export function canReadContractReceipts(
	session: LoggedUserSession,
	contract: ContractDetail,
) {
	return (
		hasPermission(session, "org:fees:read_all") ||
		(hasPermission(session, "org:fees:read_assigned") &&
			contract.assignments.some(
				(assignment) =>
					assignment.isActive &&
					!assignment.isSoftDeleted &&
					assignment.employeeId === session.employee.id &&
					["RESPONSIBLE", "RECOMMENDED", "ADMIN_ASSISTANT"].includes(
						assignment.assignmentTypeValue,
					),
			))
	);
}
