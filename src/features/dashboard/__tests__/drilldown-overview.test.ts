import { describe, expect, it } from "vitest";
import { buildDrilldownOverview } from "../hooks/use-drilldown-overview";
import type { DashboardDrilldownRow } from "../schemas/drilldown";

function row(
	id: string,
	amount: number,
	extra: Partial<DashboardDrilldownRow> = {},
): DashboardDrilldownRow {
	return {
		id,
		amount,
		date: "2026-10-01T00:00:00.000Z",
		kind: "Recebimento",
		description: "Teste",
		record: { kind: "fee", id: 1 },
		...extra,
	};
}

describe("drilldown overview", () => {
	it("groups the entire dataset by stable identity and sorts totals descending", () => {
		const blocks = buildDrilldownOverview({
			selection: { kind: "metric", value: "revenue" },
			rows: [
				row("1", 0.1, { client: "Mesmo nome", clientId: 1 }),
				row("2", 0.2, { client: "Mesmo nome", clientId: 1 }),
				row("3", 500, { client: "Mesmo nome", clientId: 2 }),
			],
		});
		expect(blocks[0].groups).toEqual([
			{ key: "2", label: "Mesmo nome", amount: 500 },
			{ key: "1", label: "Mesmo nome", amount: 0.3 },
		]);
		expect(blocks.map((block) => block.key)).toEqual(["client"]);
	});
	it("sorts mixed signed amounts by magnitude without changing their signs", () => {
		const blocks = buildDrilldownOverview({
			selection: { kind: "metric", value: "result" },
			rows: [
				row("a", -1628, { kind: "Despesa" }),
				row("c", 500, { kind: "Entrada inicial" }),
				row("b", -253, {
					kind: "Recebimento",
					date: "2026-11-01T00:00:00.000Z",
				}),
			],
		});
		expect(blocks.map((block) => block.key)).toEqual(["kind"]);
		expect(blocks[0].groups.map((group) => group.amount)).toEqual([
			-1628, 500, -253,
		]);
	});
	it("uses remuneration and expense dimensions and outstanding amount", () => {
		const blocks = buildDrilldownOverview({
			selection: { kind: "metric", value: "remuneration" },
			rows: [
				row("a", 20, {
					employeeId: 1,
					employee: "Ana",
					assignment: "Advogada",
					assignmentValue: "LAWYER",
				}),
			],
		});
		expect(blocks.map((block) => block.key)).toEqual([
			"employee",
			"assignment",
		]);
		const expenses = buildDrilldownOverview({
			selection: { kind: "metric", value: "expense" },
			rows: [row("a", 100, { category: "Aluguel", categoryValue: "RENT" })],
		});
		expect(expenses.map((block) => block.key)).toEqual(["category"]);
		const outstanding = buildDrilldownOverview({
			selection: { kind: "aging", value: "Até 30 dias" },
			rows: [
				row("a", 30, { faceAmount: 100, paid: 70, client: "Ana", clientId: 1 }),
			],
		});
		expect(outstanding[0].groups[0].amount).toBe(30);
	});
	it("handles empty rows and deterministic ties", () => {
		expect(
			buildDrilldownOverview({
				selection: { kind: "metric", value: "expense" },
				rows: [],
			}),
		).toEqual([]);
		const blocks = buildDrilldownOverview({
			selection: { kind: "metric", value: "revenue" },
			rows: [
				row("b", 1, { client: "B", clientId: 2 }),
				row("a", 1, { client: "A", clientId: 1 }),
			],
		});
		expect(blocks[0].groups.map((group) => group.label)).toEqual(["A", "B"]);
	});
});
