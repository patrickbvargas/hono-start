import { describe, expect, it } from "vitest";
import {
	canReadDashboardFirmResult,
	getDashboardPayableWhere,
	getDashboardReceivableWhere,
} from "../data/scope";
import { scope } from "./financial-fixtures";

describe("dashboard scoped financial reads", () => {
	it("ignores forged employee filters for own remuneration", () => {
		const s = scope();
		s.isAdmin = false;
		s.access = {
			...s.access,
			remunerationAll: false,
			revenueAll: false,
			expense: false,
		};
		s.search.employeeId = "999";
		const where = getDashboardPayableWhere(s);
		expect(where).toMatchObject({
			firmId: 1,
			OR: [
				{
					beneficiary: { personId: 12 },
					remunerationPayable: {
						contractAssignment: {
							employeeProfileId: 2,
							contract: {
								assignments: {
									some: {
										employeeProfileId: 2,
										assignmentType: {
											value: { in: ["RESPONSIBLE", "RECOMMENDED"] },
										},
									},
								},
							},
						},
					},
				},
			],
		});
	});
	it("requires an assigned contract for limited receivable reads", () => {
		const s = scope();
		s.access = { ...s.access, revenueAll: false };
		expect(getDashboardReceivableWhere(s)).toMatchObject({
			firmId: 1,
			contractRevenueReceivable: {
				firmId: 1,
				contract: { assignments: { some: { employeeProfileId: 2 } } },
			},
		});
	});
	it("denies own remuneration without a linked person and employee", () => {
		const s = scope();
		s.personId = undefined;
		s.employeeId = undefined;
		s.access = { ...s.access, remunerationAll: false, expense: false };
		expect(getDashboardPayableWhere(s)).toMatchObject({
			OR: [
				{
					beneficiary: { personId: -1 },
					remunerationPayable: {
						contractAssignment: { employeeProfileId: -1 },
					},
				},
			],
		});
	});
	it("does not filter out deleted or completed operational origins from financial obligations", () => {
		const s = scope();
		s.search.contractId = "3";
		const text = JSON.stringify(getDashboardReceivableWhere(s));
		expect(text).toContain('"firmId":1');
		expect(text).not.toContain("deletedAt");
		expect(text).not.toContain("isActive");
	});
	it("shows consolidated cash only with all required grants and no attribution filters", () => {
		const s = scope();
		expect(canReadDashboardFirmResult(s)).toBe(true);
		s.access.payments = false;
		expect(canReadDashboardFirmResult(s)).toBe(false);
		s.access.payments = true;
		s.search.employeeId = "2";
		expect(canReadDashboardFirmResult(s)).toBe(false);
	});
});
