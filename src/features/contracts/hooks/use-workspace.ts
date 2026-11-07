import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { canReadContractReceivables } from "../utils/workflow-access";
import { getContractWorkspaceAlerts } from "../utils/workspace-alerts";
import { useContract } from "./use-data";
export function useContractWorkspace(id: number) {
	const { contract } = useContract(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const canReadTitles = canReadContractReceivables(session, contract);
	const canDelete =
		!contract.isSoftDeleted && hasPermission(session, "org:contracts:delete");
	const canRestore =
		contract.isSoftDeleted && hasPermission(session, "org:contracts:restore");
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	const alerts = getContractWorkspaceAlerts(contract, today, canReadTitles);
	const canEdit =
		!contract.isSoftDeleted &&
		!["COMPLETED", "CANCELLED"].includes(contract.statusValue) &&
		(hasPermission(session, "org:contracts:update_all") ||
			(hasPermission(session, "org:contracts:update_assigned") &&
				contract.isAssignedToActor));
	return {
		contract,
		alerts,
		session,
		overlay,
		canReadTitles,
		canEdit,
		canDelete,
		canRestore,
	};
}
