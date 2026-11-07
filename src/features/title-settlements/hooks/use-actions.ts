import { useOverlay } from "@/shared/hooks/use-overlay";
import { can, useLoggedUserSession } from "@/shared/session";

interface UseSettlementActionsOptions {
	direction: "receivable" | "payable";
	contractId?: number | null;
	isAssignedToActor?: boolean;
}
export function useSettlementActions({
	direction,
	contractId,
	isAssignedToActor,
}: UseSettlementActionsOptions) {
	const session = useLoggedUserSession();
	const { overlay } = useOverlay();
	return {
		overlay,
		canCreate: can(
			session,
			direction === "receivable"
				? "org:receipts:create"
				: "org:payments:create",
			{
				firmId: session.firm.id,
				contract: contractId
					? { firmId: session.firm.id, isAssignedToActor }
					: undefined,
			},
		),
		canReverse: can(
			session,
			direction === "receivable"
				? "org:receipts:reverse"
				: "org:payments:reverse",
			{ firmId: session.firm.id },
		),
	};
}
