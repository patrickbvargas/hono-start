import { can, hasPermission, useLoggedUserSession } from "@/shared/session";
import { usePayable } from "./use-data";
export function usePayableWorkspace(id: number) {
	const { payable } = usePayable(id);
	const session = useLoggedUserSession();
	const canReadPayments = can(
		session,
		["org:payments:read_all", "org:payments:read_own"],
		{
			firmId: session.firm.id,
			beneficiaryPersonId: payable.beneficiaryPersonId,
			isRemuneration: payable.isRemuneration,
			contract: payable.contractId
				? {
						firmId: session.firm.id,
						isAssignedToActor: payable.isAssignedToActor,
					}
				: undefined,
		},
	);
	return {
		payable,
		canReadPayments,
		canReadAttachments: hasPermission(session, "org:attachments:read"),
		canReadAudit: hasPermission(session, "org:audit_logs:read"),
		canReadExpense: hasPermission(session, "org:expenses:read"),
		canReadContract: can(
			session,
			["org:contracts:read_all", "org:contracts:read_assigned"],
			{
				firmId: session.firm.id,
				isAssignedToActor: payable.isAssignedToActor,
			},
		),
	};
}
