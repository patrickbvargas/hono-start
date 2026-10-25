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
	const now = new Date();
	const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const alerts = getContractWorkspaceAlerts(contract, today);
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
		registerReceipt,
	};
}
