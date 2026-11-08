import { Prisma } from "@/generated/prisma/client";
import type { DashboardRecords } from "../data/records";
import type { DashboardScope } from "../data/scope";
export const money = (value: number) => new Prisma.Decimal(value);
export function scope(): DashboardScope & {
	access: NonNullable<DashboardScope["access"]>;
} {
	return {
		firmId: 1,
		personId: 12,
		employeeId: 2,
		employeeTypeValue: "LAWYER",
		isAdmin: true,
		canReadCashFlow: true,
		access: {
			revenue: true,
			revenueAll: true,
			remuneration: true,
			remunerationAll: true,
			expense: true,
			receipts: true,
			payments: true,
		},
		search: {
			dateFrom: "2026-01-01",
			dateTo: "2026-03-31",
			employeeId: "",
			legalArea: [],
			revenueType: [],
		},
	};
}
export function records(): DashboardRecords {
	const contract = {
		id: 3,
		processNumber: "PROC-3",
		customer: { id: 4, person: { fullName: "Cliente" } },
		legalArea: { label: "Cível", value: "CIVIL" },
		assignments: [
			{
				employeeProfile: { person: { fullName: "Advogada" } },
				assignmentType: { value: "RESPONSIBLE" },
			},
		],
	};
	return {
		scope: scope(),
		receivables: [
			{
				id: 1,
				amount: money(100),
				dueDate: new Date("2026-01-10"),
				cancelledAt: null,
				kind: "DOWN_PAYMENT",
				debtor: { person: { fullName: "Cliente" } },
				analytic: { label: "Outros", value: "OTHER" },
				receipts: [
					{
						id: 1,
						principalAbated: money(100),
						effectiveAmount: money(90),
						effectiveDate: new Date("2026-01-15"),
						reversal: { effectiveDate: new Date("2026-02-02") },
					},
				],
				contractRevenueReceivable: {
					contract,
					revenue: {
						revenueType: { label: "Administrativo", value: "ADMINISTRATIVE" },
					},
				},
			},
		],
		payables: [
			{
				id: 2,
				amount: money(50),
				dueDate: new Date("2026-01-10"),
				cancelledAt: null,
				kind: "INSTALLMENT",
				beneficiary: { person: { fullName: "Fornecedor" } },
				analytic: { label: "Insumos", value: "SUPPLIES" },
				payments: [
					{
						id: 1,
						principalAbated: money(50),
						effectiveAmount: money(45),
						effectiveDate: new Date("2026-01-16"),
						reversal: null,
					},
				],
				remunerationPayable: null,
			},
		],
	};
}
