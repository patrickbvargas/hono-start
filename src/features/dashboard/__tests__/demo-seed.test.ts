import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
	createClientSeeds,
	createEmployeeSeeds,
} from "../../../../prisma/seed-fixtures";
import {
	createContractSeeds,
	createExpenseSeeds,
	getSeedReferenceDate,
	seedDate,
} from "../../../../prisma/seed-scenarios";
import { getRevenueReceived, type RevenueRow } from "../data/revenue";
import { getScheduledRevenue } from "../data/schedule";
import {
	type DashboardPeriod,
	getComparisonBoundaries,
	getDashboardPeriod,
} from "../utils/period";

function fixtures(date: string) {
	const reference = getSeedReferenceDate(date);
	return {
		reference,
		contracts: createContractSeeds(
			createClientSeeds(),
			createEmployeeSeeds(),
			reference,
		),
		expenses: createExpenseSeeds(reference),
	};
}

function revenues(date: string): RevenueRow[] {
	return fixtures(date)
		.contracts.filter((c) => c.isActive && !c.deletedAt)
		.flatMap((c, contractId) =>
			c.revenues
				.filter((r) => r.isActive && !r.deletedAt)
				.map((r, id) => ({
					id,
					totalValue: new Prisma.Decimal(r.totalValue),
					downPaymentValue: r.downPaymentValue
						? new Prisma.Decimal(r.downPaymentValue)
						: null,
					paymentStartDate: new Date(r.paymentStartDate),
					totalInstallments: r.totalInstallments,
					type: { value: r.typeValue, label: r.typeValue },
					contract: {
						id: contractId,
						processNumber: c.processNumber,
						client: { id: 1, fullName: "Cliente" },
						legalArea: { value: c.legalAreaValue, label: c.legalAreaValue },
						assignments: [],
					},
					fees: r.fees
						.filter((f) => f.isActive && !f.deletedAt)
						.map((f) => ({
							amount: new Prisma.Decimal(f.amount),
							installmentNumber: f.installmentNumber,
							paymentDate: new Date(f.paymentDate),
						})),
				})),
		);
}

describe("client-preview seed financial contract", () => {
	it.each(["2026-10-26", "2027-01-01", "2028-02-29", "2026-12-31"])(
		"covers rolling monthly history without future realized values at %s",
		(date) => {
			const { reference, contracts, expenses } = fixtures(date);
			const fees = contracts.flatMap((c) => c.revenues.flatMap((r) => r.fees));
			for (
				let year = reference.getUTCFullYear() - 2;
				year <= reference.getUTCFullYear();
				year++
			) {
				const months =
					year === reference.getUTCFullYear()
						? reference.getUTCMonth() + 1
						: 12;
				for (let month = 1; month <= months; month++) {
					const prefix = `${year}-${String(month).padStart(2, "0")}`;
					expect(
						fees.some(
							(f) =>
								f.paymentDate.startsWith(prefix) &&
								f.generatesRemuneration &&
								!f.deletedAt,
						),
					).toBe(true);
					expect(
						expenses.some(
							(e) =>
								e.expenseDate.startsWith(prefix) && e.isActive && !e.deletedAt,
						),
					).toBe(true);
				}
			}
			expect(fees.every((f) => new Date(f.paymentDate) <= reference)).toBe(
				true,
			);
			expect(expenses.every((e) => new Date(e.expenseDate) <= reference)).toBe(
				true,
			);
			expect(new Set(contracts.map((c) => c.processNumber)).size).toBe(
				contracts.length,
			);
			for (const c of contracts) {
				const [sequence, check, year, justice, court, origin] =
					c.processNumber.split(/[-.]/);
				expect(
					BigInt(`${sequence}${year}${justice}${court}${origin}${check}`) % 97n,
				).toBe(1n);
				expect(new Date(c.createdAt ?? "invalid") <= reference).toBe(true);
			}
			expect(fixtures(date)).toEqual(fixtures(date));
		},
	);

	it("feeds actual dashboard YTD and same-date prior-year boundaries including entries", () => {
		const rows = revenues("2026-10-26");
		const search = {
			dateFrom: "2026-01-01",
			dateTo: "2026-10-26",
			employeeId: "",
			legalArea: [],
			revenueType: [],
		};
		const bounds = getComparisonBoundaries(search);
		expect(bounds.previousStart.toISOString().slice(0, 10)).toBe("2025-01-01");
		expect(bounds.previousEndExclusive.toISOString().slice(0, 10)).toBe(
			"2025-10-27",
		);
		const current = getDashboardPeriod(search);
		const prior = {
			hasPeriod: true,
			dateFrom: bounds.previousStart,
			dateTo: new Date(bounds.previousEndExclusive.getTime() - 1),
		};
		const sum = (period: DashboardPeriod) =>
			rows.reduce(
				(total, row) => total.add(getRevenueReceived(row, period)),
				new Prisma.Decimal(0),
			);
		expect(sum(current).toFixed(2)).toBe("273210.00");
		expect(sum(prior).toFixed(2)).toBe("243657.40");
		expect(getScheduledRevenue(rows, current).gt(0)).toBe(true);
		expect(getScheduledRevenue(rows, prior).gt(0)).toBe(true);
		const expenses = fixtures("2026-10-26").expenses.filter(
			(e) => e.isActive && !e.deletedAt,
		);
		const expenseTotal = (year: string) =>
			expenses
				.filter(
					(e) =>
						e.expenseDate >= `${year}-01-01` && e.expenseDate < `${year}-10-27`,
				)
				.reduce((total, e) => total.add(e.amount), new Prisma.Decimal(0));
		expect(expenseTotal("2026").gt(0)).toBe(true);
		expect(expenseTotal("2025").gt(0)).toBe(true);
		expect(sum(current).equals(sum(prior))).toBe(false);
	});

	it("keeps totals coherent and includes lifecycle and forecast examples", () => {
		const { contracts, reference } = fixtures("2026-10-26");
		expect(contracts.some((c) => c.statusValue === "CANCELLED")).toBe(true);
		expect(contracts.some((c) => !c.isActive)).toBe(true);
		expect(contracts.some((c) => c.deletedAt)).toBe(true);
		expect(contracts.some((c) => !c.allowStatusChange)).toBe(true);
		expect(contracts.some((c) => c.revenues.length > 1)).toBe(true);
		expect(
			contracts.some((c) => c.assignments.every((a) => a.isActive === false)),
		).toBe(true);
		expect(contracts.some((c) => c.revenues.every((r) => !r.isActive))).toBe(
			true,
		);
		expect(
			contracts.some((c) =>
				c.revenues.some(
					(r) =>
						new Date(r.paymentStartDate) > reference &&
						r.fees.length === 0 &&
						!r.downPaymentValue,
				),
			),
		).toBe(true);
		const fees = contracts.flatMap((c) => c.revenues.flatMap((r) => r.fees));
		expect(fees.some((f) => !f.generatesRemuneration)).toBe(true);
		expect(fees.some((f) => f.manualAdjustment)).toBe(true);
		expect(fees.some((f) => f.deletedAt)).toBe(true);
		for (const c of contracts) {
			for (const r of c.revenues) {
				const paid = r.fees
					.filter((f) => f.isActive && !f.deletedAt)
					.reduce(
						(sum, f) => sum.add(f.amount),
						new Prisma.Decimal(r.downPaymentValue ?? 0),
					);
				expect(paid.lte(r.totalValue)).toBe(true);
				expect(
					r.fees.every((f) => f.installmentNumber <= r.totalInstallments),
				).toBe(true);
				if (c.statusValue === "COMPLETED") {
					expect(paid.equals(r.totalValue)).toBe(true);
				}
			}
		}
	});

	it("validates dates and clamps leap-day month arithmetic", () => {
		for (const value of ["2026-02-29", "2026-13-01", "nonsense", "2026-1-1"]) {
			expect(() => getSeedReferenceDate(value)).toThrow("SEED_REFERENCE_DATE");
		}
		expect(seedDate(2028, 1, 31)).toBe("2028-02-29T12:00:00.000Z");
	});

	it("reset explicitly generates client and invokes seed once", () => {
		const pkg = JSON.parse(
			readFileSync(
				new URL("../../../../package.json", import.meta.url),
				"utf8",
			),
		);
		expect(pkg.scripts["db:reset"]).toBe(
			"prisma migrate reset --force && prisma generate && prisma db seed",
		);
	});
});
