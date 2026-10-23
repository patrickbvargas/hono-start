import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateChangePercent, type RevenueRow } from "../data/revenue";
import { buildRevenueSchedule, getScheduledRevenue } from "../data/schedule";

const revenue: RevenueRow = {
	id: 1,
	totalValue: new Prisma.Decimal(100),
	downPaymentValue: null,
	paymentStartDate: new Date("2026-01-31T00:00:00Z"),
	totalInstallments: 3,
	type: { label: "Judicial", value: "JUDICIAL" },
	contract: {
		processNumber: "1",
		client: { fullName: "Cliente" },
		legalArea: { label: "Cível", value: "CIVIL" },
		assignments: [],
	},
	fees: [
		{
			amount: new Prisma.Decimal(10),
			paymentDate: new Date("2026-02-28T00:00:00Z"),
			installmentNumber: 1,
		},
	],
};

describe("dashboard contractual schedule", () => {
	it("preserves cents and subtracts partial payments as of reference", () => {
		const schedule = buildRevenueSchedule(revenue, new Date("2026-03-01"));
		expect(schedule.map((item) => Number(item.amount))).toEqual([
			33.33, 33.33, 33.34,
		]);
		expect(Number(schedule[0].outstanding)).toBe(23.33);
		expect(schedule[0].dueDate.toISOString()).toContain("2026-02-28");
		expect(
			Number(
				buildRevenueSchedule(revenue, new Date("2026-02-01"))[0].outstanding,
			),
		).toBe(33.33);
	});
	it("forecasts only installments due in the selected period", () => {
		expect(
			Number(
				getScheduledRevenue([revenue], {
					hasPeriod: true,
					dateFrom: new Date("2026-02-01"),
					dateTo: new Date("2026-02-28T23:59:59Z"),
				}),
			),
		).toBe(33.33);
	});
	it("does not invent growth from zero and handles negative bases", () => {
		expect(
			calculateChangePercent(new Prisma.Decimal(10), new Prisma.Decimal(0)),
		).toBeNull();
		expect(
			calculateChangePercent(new Prisma.Decimal(10), new Prisma.Decimal(-10)),
		).toBe(200);
	});
});
