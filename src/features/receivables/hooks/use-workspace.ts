import { can, hasPermission, useLoggedUserSession } from "@/shared/session";
import { useReceivable } from "./use-data";
export function useReceivableWorkspace(id: number) {
	const { receivable } = useReceivable(id);
	const session = useLoggedUserSession();
	const canReadReceipts = can(
		session,
		["org:receipts:read_all", "org:receipts:read_assigned"],
		{
			firmId: session.firm.id,
			contract: receivable.contractId
				? {
						firmId: session.firm.id,
						isAssignedToActor: receivable.isAssignedToActor,
					}
				: undefined,
		},
	);
	return {
		receivable,
		canReadReceipts,
		canReadAttachments: hasPermission(session, "org:attachments:read"),
		canReadAudit: hasPermission(session, "org:audit_logs:read"),
		canReadDebtor: hasPermission(session, "org:clients:read"),
		canReadContract: can(
			session,
			["org:contracts:read_all", "org:contracts:read_assigned"],
			{
				firmId: session.firm.id,
				isAssignedToActor: receivable.isAssignedToActor,
			},
		),
	};
}
