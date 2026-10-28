import { describe, expect, it } from "vitest";
import { formatter } from "@/shared/lib/formatter";
import {
	defaultContractAssignmentValues,
	defaultContractRevenueValues,
} from "../utils/default";
import { getAssignmentSummary, getRevenueSummary } from "../utils/form-summary";

describe("contract form summaries", () => {
	it("shows pending labels before selections and resolves available labels", () => {
		const assignment = defaultContractAssignmentValues();
		expect(getAssignmentSummary(assignment, 1, [], [])).toBe(
			"Colaborador 2 • Atribuição pendente",
		);
		expect(
			getAssignmentSummary(
				{ ...assignment, employeeId: "7", assignmentType: "RESPONSIBLE" },
				0,
				[{ id: 7, value: "7", label: "Maria", isDisabled: false }],
				[
					{
						id: 1,
						value: "RESPONSIBLE",
						label: "Responsável",
						isDisabled: false,
					},
				],
			),
		).toBe("Maria • Responsável");
	});
	it("keeps legacy selections readable when options no longer contain them", () => {
		expect(
			getAssignmentSummary(
				{
					...defaultContractAssignmentValues(),
					employeeId: "7",
					assignmentType: "OLD",
				},
				0,
				[],
				[],
			),
		).toBe("Colaborador #7 • OLD");
	});
	it("formats revenue totals and retains pending and unknown type fallbacks", () => {
		const revenue = defaultContractRevenueValues();
		expect(getRevenueSummary(revenue, 1, [])).toBe(
			"Receita 2 • Valor pendente",
		);
		expect(
			getRevenueSummary({ ...revenue, type: "OLD", totalValue: 1200 }, 0, []),
		).toBe(
			`OLD • ${formatter.currency(1200)} • 1x de ${formatter.currency(1200)}`,
		);
		expect(
			getRevenueSummary({ ...revenue, type: "JUDICIAL" }, 0, [
				{ id: 1, value: "JUDICIAL", label: "Judicial", isDisabled: false },
			]),
		).toBe("Judicial • Valor pendente");
	});
});
