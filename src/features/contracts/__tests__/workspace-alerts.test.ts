import { describe, expect, it } from "vitest";
import type { ContractDetail } from "../schemas/model";
import { getContractWorkspaceAlerts } from "../utils/workspace-alerts";

describe("contract alerts", () => {
	it("separates overdue dates from future balances and ignores inactive revenues", () => {
		const contract = {
			assignments: [
				{
					isActive: true,
					isSoftDeleted: false,
					assignmentTypeValue: "RESPONSIBLE",
				},
			],
			revenues: [
				{
					id: 1,
					type: "Judicial",
					isActive: true,
					isSoftDeleted: false,
					remainingValue: 500,
					isFullyPaid: false,
					nextDueDate: "2026-10-23",
				},
				{
					id: 2,
					type: "Administrativo",
					isActive: true,
					isSoftDeleted: false,
					remainingValue: 300,
					isFullyPaid: false,
					nextDueDate: "2026-10-24",
				},
				{ id: 3, isActive: false, isSoftDeleted: false },
			],
		} as ContractDetail;
		const alerts = getContractWorkspaceAlerts(contract, "2026-10-24");
		expect(alerts).toHaveLength(2);
		expect(alerts.map((a) => a.severity)).toEqual(["high", "low"]);
		expect(alerts[0].description).toContain("inclui parcelas futuras");
	});
	it("flags missing active data but does not require notes or attachments", () => {
		const alerts = getContractWorkspaceAlerts(
			{ revenues: [], assignments: [] } as unknown as ContractDetail,
			"2026-10-24",
		);
		expect(alerts.map((a) => a.id)).toEqual(["no-revenues", "no-responsible"]);
	});
	it("has no alerts for settled revenues with a responsible assignment", () => {
		const contract = {
			assignments: [
				{
					isActive: true,
					isSoftDeleted: false,
					assignmentTypeValue: "RESPONSIBLE",
				},
			],
			revenues: [
				{
					isActive: true,
					isSoftDeleted: false,
					isFullyPaid: true,
					remainingValue: 0,
				},
			],
		} as ContractDetail;
		expect(getContractWorkspaceAlerts(contract, "2026-10-24")).toEqual([]);
	});
});
