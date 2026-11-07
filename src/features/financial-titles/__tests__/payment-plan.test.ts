import { describe, expect, it } from "vitest";
import {
	revenueTitlePlanInputSchema,
	revenueTitleScheduleInputSchema,
} from "../schemas/form";
import {
	buildRevenueTitlePlan,
	getTitlePlanCents,
} from "../utils/payment-plan";

const schedule = {
	negotiatedAmount: 1000,
	downPaymentAmount: 0,
	downPaymentDueDate: "",
	installmentCount: 3,
	firstDueDate: "2026-01-31",
	analytic: "OTHER",
	expectedPaymentMethod: "PIX",
};

describe("editable revenue title preview", () => {
	it("splits remainder cents exactly and keeps original month-end anchor", () => {
		const titles = buildRevenueTitlePlan(schedule);
		expect(titles.map((title) => title.amount)).toEqual([
			333.34, 333.33, 333.33,
		]);
		expect(titles.map((title) => title.dueDate)).toEqual([
			"2026-01-31",
			"2026-02-28",
			"2026-03-31",
		]);
		expect(getTitlePlanCents(titles)).toBe(100000n);
	});
	it("adds optional entry as DOWN_PAYMENT and distributes remaining principal", () => {
		const titles = buildRevenueTitlePlan({
			...schedule,
			downPaymentAmount: 100,
			downPaymentDueDate: "2026-01-01",
		});
		expect(titles[0]).toMatchObject({
			kind: "DOWN_PAYMENT",
			amount: 100,
			dueDate: "2026-01-01",
		});
		expect(titles.slice(1).map((title) => title.amount)).toEqual([
			300, 300, 300,
		]);
		expect(getTitlePlanCents(titles)).toBe(100000n);
	});
	it("rejects impossible schedules and missing entry date", () => {
		for (const change of [
			{ downPaymentAmount: 1000 },
			{ installmentCount: 0 },
			{ downPaymentAmount: 999.99 },
			{ downPaymentAmount: 100 },
		]) {
			expect(
				revenueTitleScheduleInputSchema.safeParse({ ...schedule, ...change })
					.success,
			).toBe(false);
		}
	});
	it("accepts edited plans only when exact closure remains intact", () => {
		const titles = buildRevenueTitlePlan(schedule);
		expect(
			revenueTitlePlanInputSchema.safeParse({
				...schedule,
				revenueId: 1,
				titles,
			}).success,
		).toBe(true);
		titles[0].amount = 333.35;
		expect(
			revenueTitlePlanInputSchema.safeParse({
				...schedule,
				revenueId: 1,
				titles,
			}).success,
		).toBe(false);
		titles[1].amount = 333.32;
		expect(
			revenueTitlePlanInputSchema.safeParse({
				...schedule,
				revenueId: 1,
				titles,
			}).success,
		).toBe(true);
	});
	it("handles leap years and tiny amounts", () => {
		const titles = buildRevenueTitlePlan({
			...schedule,
			negotiatedAmount: 0.03,
			firstDueDate: "2028-01-31",
		});
		expect(titles.map((title) => title.amount)).toEqual([0.01, 0.01, 0.01]);
		expect(titles[1].dueDate).toBe("2028-02-29");
	});
});
