import { describe, expect, it } from "vitest";
import { assertContractSectionChanges } from "../rules/permissions";
import { defaultContractCreateValues } from "../utils/default";

const existing = { ...defaultContractCreateValues(), id: 1 };
const assert = (
	input = existing,
	canManageAssignments = false,
	canManageRevenues = false,
) =>
	assertContractSectionChanges({
		input,
		existing,
		canManageAssignments,
		canManageRevenues,
	});

describe("contract section permissions", () => {
	it("allows general edits with restricted sections unchanged", () => {
		expect(() => assert({ ...existing, notes: "Changed" })).not.toThrow();
	});
	it("rejects financial percentage changes without terms authority", () => {
		expect(() => assert({ ...existing, feePercentage: 0.5 })).toThrow(
			"condições financeiras",
		);
	});
	it("rejects team additions, removals and replacements", () => {
		for (const assignments of [
			[],
			[
				...existing.assignments,
				{ ...existing.assignments[0], employeeId: "2" },
			],
			[{ ...existing.assignments[0], employeeId: "3" }],
		]) {
			expect(() => assert({ ...existing, assignments })).toThrow("equipe");
		}
	});
	it("rejects plan changes independently of team authority", () => {
		expect(() =>
			assert(
				{
					...existing,
					revenues: [{ ...existing.revenues[0], totalValue: 500 }],
				},
				true,
			),
		).toThrow("condições financeiras");
	});
	it("terms authority does not grant team authority", () => {
		expect(() => assert({ ...existing, assignments: [] }, false, true)).toThrow(
			"equipe",
		);
	});
	it("allows authorized sensitive edits", () => {
		expect(() =>
			assert(
				{ ...existing, assignments: [], revenues: [], feePercentage: 0.5 },
				true,
				true,
			),
		).not.toThrow();
	});
	it("ignores ordering but checks IDs and activation", () => {
		const assignments = [
			{ ...existing.assignments[0], id: 1 },
			{ ...existing.assignments[0], id: 2 },
		];
		expect(() =>
			assertContractSectionChanges({
				existing: { ...existing, assignments },
				input: { ...existing, assignments: [...assignments].reverse() },
				canManageAssignments: false,
				canManageRevenues: false,
			}),
		).not.toThrow();
		expect(() =>
			assert({
				...existing,
				assignments: [{ ...existing.assignments[0], isActive: false }],
			}),
		).toThrow("equipe");
	});
});
