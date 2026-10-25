import { useState } from "react";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { canReadContractReceipts } from "../utils/workflow-access";
import { getContractWorkspaceAlerts } from "../utils/workspace-alerts";
import { useContract } from "./use-data";
export function useContractWorkspace(id: number) {
	const { contract } = useContract(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const [selectedRevenue, setSelectedRevenue] = useState<number | null>(null);
	const canReadFees = canReadContractReceipts(session, contract);
	const canDelete =
		!contract.isSoftDeleted && hasPermission(session, "org:contracts:delete");
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	const alerts = getContractWorkspaceAlerts(contract, today, canReadFees);
	const canEdit =
		!contract.isSoftDeleted &&
		!["COMPLETED", "CANCELLED"].includes(contract.statusValue) &&
		(hasPermission(session, "org:contracts:update_all") ||
			(hasPermission(session, "org:contracts:update_assigned") &&
				contract.isAssignedToActor));
	function registerReceipt(revenueId: number) {
		setSelectedRevenue(revenueId);
		overlay.create.open();
	}
	return {
		contract,
		alerts,
		session,
		overlay,
		selectedRevenue,
		canReadFees,
		canEdit,
		canDelete,
		registerReceipt,
	};
}
