import { describe, expect, it } from "vitest";
import type { ContractDetail } from "../schemas/model";
import { getContractWorkspaceAlerts } from "../utils/workspace-alerts";

const revenue = {
	id: 1,
	type: "Judicial",
	isActive: true,
	isSoftDeleted: false,
	remainingValue: 100,
	isFullyPaid: false,
	installmentsPaid: 0,
	totalInstallments: 2,
	nextDueDate: "2026-10-25",
};
const contract = (revenues: unknown[] = [revenue], extra = {}) =>
	({
		isActive: true,
		isSoftDeleted: false,
		statusValue: "ACTIVE",
		revenues,
		assignments: [],
		...extra,
	}) as unknown as ContractDetail;

describe("contract alerts", () => {
	it("exposes calendar due date, elapsed days and full remaining balance", () => {
		expect(
			getContractWorkspaceAlerts(
				contract([{ ...revenue, nextDueDate: "2026-09-30" }]),
				"2026-10-25",
			)[0],
		).toMatchObject({
			dueDate: "2026-09-30",
			overdueDays: 25,
			remainingAmount: 100,
		});
		expect(
			getContractWorkspaceAlerts(contract(), "2026-10-25")[0],
		).toMatchObject({
			dueDate: "2026-10-25",
			overdueDays: null,
			remainingAmount: 100,
		});
		expect(
			getContractWorkspaceAlerts(
				contract([{ ...revenue, installmentsPaid: 2 }]),
				"2026-10-25",
			)[0],
		).toMatchObject({ dueDate: null, overdueDays: null, remainingAmount: 100 });
	});
	it("never treats blocked creation data as pending work", () => {
		expect(getContractWorkspaceAlerts(contract([]), "2026-10-25")).toEqual([]);
	});
	it("limits upcoming alerts to today through seven calendar days", () => {
		expect(
			getContractWorkspaceAlerts(contract(), "2026-10-25")[0].severity,
		).toBe("medium");
		expect(
			getContractWorkspaceAlerts(
				contract([{ ...revenue, nextDueDate: "2026-11-01" }]),
				"2026-10-25",
			)[0].severity,
		).toBe("medium");
		expect(
			getContractWorkspaceAlerts(
				contract([{ ...revenue, nextDueDate: "2026-11-02" }]),
				"2026-10-25",
			),
		).toEqual([]);
	});
	it("prioritizes exhausted plans over overdue dates without duplicating the revenue", () => {
		const alerts = getContractWorkspaceAlerts(
			contract([
				{ ...revenue, installmentsPaid: 2, nextDueDate: "2026-10-01" },
			]),
			"2026-10-25",
		);
		expect(alerts).toHaveLength(1);
		expect(alerts[0].id).toBe("balance-1");
		expect(alerts[0].severity).toBe("high");
	});
	it("warns about overdue balances on inactive contracts but omits upcoming reminders", () => {
		expect(
			getContractWorkspaceAlerts(
				contract([{ ...revenue, nextDueDate: "2026-10-24" }], {
					isActive: false,
				}),
				"2026-10-25",
			)[0].severity,
		).toBe("high");
		expect(
			getContractWorkspaceAlerts(
				contract([revenue], { isActive: false }),
				"2026-10-25",
			),
		).toEqual([]);
	});
	it("treats settled active contracts as a low severity review rather than an error", () => {
		const paid = { ...revenue, isFullyPaid: true, remainingValue: 0 };
		expect(
			getContractWorkspaceAlerts(contract([paid]), "2026-10-25")[0].severity,
		).toBe("low");
		expect(
			getContractWorkspaceAlerts(
				contract([paid], { statusValue: "COMPLETED" }),
				"2026-10-25",
			),
		).toEqual([]);
	});
	it("omits all financial alerts when unauthorized or deleted, and ignores inactive revenues", () => {
		expect(getContractWorkspaceAlerts(contract(), "2026-10-25", false)).toEqual(
			[],
		);
		expect(
			getContractWorkspaceAlerts(
				contract([revenue], { isSoftDeleted: true }),
				"2026-10-25",
			),
		).toEqual([]);
		expect(
			getContractWorkspaceAlerts(
				contract([{ ...revenue, isActive: false }]),
				"2026-10-25",
			),
		).toEqual([]);
	});
});
