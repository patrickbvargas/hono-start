import { useQueryClient } from "@tanstack/react-query";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { can, hasPermission, useLoggedUserSession } from "@/shared/session";
import { contractKeys } from "../api/queries";
import type { ContractDetail } from "../schemas/model";

export function useRevenueGeneration(contract: ContractDetail) {
	const session = useLoggedUserSession();
	const client = useQueryClient();
	const { overlay } = useOverlay<number>();
	const resource = {
		firmId: session.firm.id,
		statusValue: contract.statusValue,
		assignments: contract.assignments
			.filter((item) => item.isActive && !item.isSoftDeleted)
			.map((item) => ({
				employeeId: item.employeeId,
				employeeTypeValue: item.employeeTypeValue,
				assignmentTypeValue: item.assignmentTypeValue,
			})),
	};
	const canGenerate =
		contract.isActive &&
		!contract.isSoftDeleted &&
		hasPermission(session, "org:receivables:generate") &&
		can(
			session,
			["org:contracts:update_all", "org:contracts:update_assigned"],
			resource,
		);
	async function refreshContract() {
		await client.invalidateQueries({ queryKey: contractKeys.all });
	}
	return { overlay, canGenerate, refreshContract };
}
