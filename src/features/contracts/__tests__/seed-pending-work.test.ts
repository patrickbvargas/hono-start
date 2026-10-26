import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
	type ContractSeedInput,
	createClientSeeds,
	createEmployeeSeeds,
} from "../../../../prisma/seed-fixtures";
import {
	createContractSeeds,
	getSeedReferenceDate,
} from "../../../../prisma/seed-scenarios";
import { contractDetailSchema } from "../schemas/model";
import { getNextContractInstallment } from "../utils/payment-plan";
import { getContractWorkspaceAlerts } from "../utils/workspace-alerts";

function detail(seed: ContractSeedInput) {
	return contractDetailSchema.parse({
		id: 1,
		processNumber: seed.processNumber,
		clientId: 1,
		client: "Cliente demonstrativo",
		lawyer: "Advogada responsável",
		legalAreaId: 1,
		legalArea: seed.legalAreaValue,
		legalAreaValue: seed.legalAreaValue,
		statusId: 1,
		status: seed.statusValue,
		statusValue: seed.statusValue,
		feePercentage: Number(seed.feePercentage),
		assignmentCount: seed.assignments.length,
		revenueCount: seed.revenues.length,
		assignedEmployeeIds: [1],
		isAssignedToActor: true,
		isActive: seed.isActive,
		isSoftDeleted: Boolean(seed.deletedAt),
		createdAt: seed.createdAt,
		updatedAt: null,
		notes: seed.notes,
		allowStatusChange: seed.allowStatusChange,
		assignments: [],
		revenues: seed.revenues.map((revenue, index) => {
			const fees = revenue.fees.filter((fee) => fee.isActive && !fee.deletedAt);
			const paid = fees.reduce(
				(total, fee) => total.add(fee.amount),
				new Prisma.Decimal(revenue.downPaymentValue ?? 0),
			);
			const remaining = Prisma.Decimal.max(
				new Prisma.Decimal(revenue.totalValue).minus(paid),
				0,
			);
			return {
				id: index + 1,
				typeId: index + 1,
				type: revenue.typeValue,
				typeValue: revenue.typeValue,
				totalValue: Number(revenue.totalValue),
				downPaymentValue:
					revenue.downPaymentValue === null
						? null
						: Number(revenue.downPaymentValue),
				paymentStartDate: revenue.paymentStartDate,
				totalInstallments: revenue.totalInstallments,
				paidValue: Number(paid),
				installmentsPaid: fees.length,
				remainingValue: Number(remaining),
				isFullyPaid: remaining.isZero(),
				isActive: revenue.isActive,
				isSoftDeleted: Boolean(revenue.deletedAt),
				...getNextContractInstallment({
					...revenue,
					paymentStartDate: new Date(revenue.paymentStartDate),
					fees,
				}),
			};
		}),
	});
}

describe("demo pending-work severity coverage", () => {
	it.each([
		"2026-01-01",
		"2026-01-31",
		"2026-02-28",
		"2028-02-29",
		"2026-03-31",
		"2026-04-30",
		"2026-10-26",
		"2026-10-31",
		"2026-12-31",
	])("includes high, medium and low examples on %s", (today) => {
		const seeds = createContractSeeds(
			createClientSeeds(),
			createEmployeeSeeds(),
			getSeedReferenceDate(today),
		);
		const examples = [
			{ notes: "Parcelas em atraso", severity: "high" },
			{ notes: "Próxima parcela em até sete dias", severity: "medium" },
			{ notes: "Quitado com conclusão bloqueada", severity: "low" },
		];
		for (const example of examples) {
			const seed = seeds.find((row) => row.notes === example.notes);
			if (!seed) {
				throw new Error(`Missing demo scenario: ${example.notes}`);
			}
			const contract = detail(seed);
			expect(
				getContractWorkspaceAlerts(contract, today).map(
					(alert) => alert.severity,
				),
			).toEqual([example.severity]);
			if (example.severity === "medium") {
				const due = new Date(`${contract.revenues[0].nextDueDate}T12:00:00Z`);
				const days =
					(due.getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86400000;
				expect(days).toBeGreaterThanOrEqual(0);
				expect(days).toBeLessThanOrEqual(7);
				expect(contract.revenues[0].nextInstallmentNumber).toBe(2);
			}
		}
	});
});
