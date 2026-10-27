import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
	createClientSeeds,
	createEmployeeSeeds,
} from "../../../../prisma/seed-fixtures";
import {
	createContractSeeds,
	createExpenseSeeds,
	createPoaSeeds,
	getSeedReferenceDate,
} from "../../../../prisma/seed-scenarios";

describe("multi-unit demo", () => {
	it.each(["2026-10-27", "2027-01-01", "2028-02-29"])(
		"keeps shared identities and independent balanced financial examples at %s",
		(date) => {
			const reference = getSeedReferenceDate(date);
			const clients = createClientSeeds();
			const employees = createEmployeeSeeds();
			const contracts = createContractSeeds(clients, employees, reference);
			const expenses = createExpenseSeeds(reference);
			const original = JSON.stringify({ contracts, expenses });
			const poa = createPoaSeeds(contracts, expenses);
			expect(poa.contracts).toHaveLength(17);
			expect(poa.expenses).toHaveLength(12);
			expect(poa.contracts.length).toBeLessThan(contracts.length);
			expect(JSON.stringify({ contracts, expenses })).toBe(original);
			expect(createPoaSeeds(contracts, expenses)).toEqual(poa);
			for (const contract of poa.contracts) {
				expect(
					clients.some((client) => client.document === contract.clientDocument),
				).toBe(true);
				for (const assignment of contract.assignments) {
					expect(
						employees.some(
							(employee) => employee.email === assignment.employeeEmail,
						),
					).toBe(true);
				}
				for (const revenue of contract.revenues) {
					const paid = revenue.fees
						.filter((fee) => !fee.deletedAt && fee.isActive)
						.reduce(
							(sum, fee) => sum.plus(fee.amount),
							new Prisma.Decimal(revenue.downPaymentValue ?? 0),
						);
					expect(paid.lte(revenue.totalValue)).toBe(true);
					for (const fee of revenue.fees)
						expect(new Date(fee.paymentDate).getTime()).toBeLessThanOrEqual(
							reference.getTime(),
						);
				}
			}
			expect(
				poa.contracts.some((contract) =>
					contract.revenues.some((revenue) =>
						revenue.fees.some((fee) => fee.generatesRemuneration),
					),
				),
			).toBe(true);
			expect(
				poa.contracts.some((contract) =>
					contract.notes.includes("Parcelas em atraso"),
				),
			).toBe(true);
			expect(poa.contracts.some((contract) => contract.deletedAt)).toBe(true);
			expect(
				poa.expenses.some((expense) => !expense.deletedAt && expense.isActive),
			).toBe(true);
			expect(poa.expenses[0].amount).not.toBe(expenses.at(-12)?.amount);
		},
	);
});
