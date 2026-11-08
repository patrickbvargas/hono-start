import { expect, it } from "vitest";
import type { ContractDetail } from "../schemas/model";
import { getContractWorkspaceAlerts } from "../utils/workspace-alerts";

it("never marks an ungenerated negotiated revenue as settled or exhausted", () => {
	const contract = {
		isActive: true,
		isSoftDeleted: false,
		statusValue: "ACTIVE",
		revenues: [
			{
				id: 1,
				type: "Judicial",
				totalValue: 1000,
				isActive: true,
				isSoftDeleted: false,
				hasGeneratedTitles: false,
				remainingValue: 0,
				isFullyPaid: false,
				installmentsPaid: 0,
				totalInstallments: 0,
				nextDueDate: null,
			},
		],
	} as ContractDetail;
	expect(getContractWorkspaceAlerts(contract, "2026-11-07")).toEqual([
		expect.objectContaining({
			id: "ungenerated-1",
			severity: "medium",
			remainingAmount: 1000,
		}),
	]);
});
