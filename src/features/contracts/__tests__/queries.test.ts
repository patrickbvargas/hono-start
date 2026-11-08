import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const db = vi.hoisted(() => ({
	contract: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
	clientProfile: { findMany: vi.fn() },
	employeeProfile: { findMany: vi.fn() },
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

import {
	getContractById,
	getContracts,
	getSelectableContractClients,
	getSelectableContractEmployees,
} from "../data/queries";
import { contractSearchDefaults } from "../utils/default";

const amount = (n: number) => new Prisma.Decimal(n);
const scope = { firmId: 1, isAdmin: true, canReadTitles: true };
const date = new Date("2026-01-01T12:00:00Z");
function title(id: number, kind = "INSTALLMENT", value = 300) {
	return {
		id,
		kind,
		amount: amount(value),
		dueDate: date,
		cancelledAt: null as Date | null,
		receipts: [] as {
			principalAbated: Prisma.Decimal;
			effectiveAmount: Prisma.Decimal;
			effectiveDate: Date;
		}[],
	};
}
function contract() {
	return {
		id: 5,
		processNumber: "PROC-5",
		firmId: 1,
		customerId: 9,
		customer: { personId: 19, person: { fullName: "Cliente", document: null } },
		legalAreaId: 7,
		legalArea: { label: "Cível", value: "CIVIL" },
		statusId: 8,
		status: { label: "Ativo", value: "ACTIVE" },
		feePercentage: amount(0.3),
		isActive: true,
		deletedAt: null,
		createdAt: date,
		updatedAt: null,
		notes: null,
		allowStatusChange: true,
		assignments: [],
		revenues: [
			{
				id: 20,
				revenueTypeId: 3,
				revenueType: { label: "Administrativo", value: "ADMINISTRATIVE" },
				negotiatedAmount: amount(1000),
				notes: null,
				createdAt: date,
				isActive: true,
				deletedAt: null,
				contractRevenueReceivables: [
					{ receivable: title(21, "DOWN_PAYMENT", 100) },
					{ receivable: title(22) },
					{ receivable: title(23) },
					{ receivable: title(24) },
				],
			},
		],
	};
}
beforeEach(() => {
	vi.clearAllMocks();
	db.contract.findFirst.mockResolvedValue(contract());
	db.contract.findMany.mockResolvedValue([contract()]);
	db.contract.count.mockResolvedValue(1);
});
describe("contract current data projections", () => {
	it("lists entry, installments, extras and cancellation without hiding title identity", async () => {
		const c = contract();
		c.revenues[0].contractRevenueReceivables.push({
			receivable: { ...title(25, "EXTRA", 50), cancelledAt: date },
		});
		db.contract.findFirst.mockResolvedValue(c);
		const result = await getContractById({ scope, id: 5 });
		expect(result.revenues[0].installments.map((t) => t.id)).toEqual([
			21, 22, 23, 24, 25,
		]);
		expect(result.revenues[0]).toMatchObject({
			remainingValue: 1000,
			hasGeneratedTitles: true,
			isFullyPaid: false,
		});
		expect(result.revenues[0].installments[4].cancelledAt).toBe(
			date.toISOString(),
		);
	});
	it.each([
		{ principal: 100, cash: 80, remaining: 900 },
		{ principal: 90, cash: 110, remaining: 910 },
	])(
		"keeps principal balance separate from actual cash $cash",
		async ({ principal, cash, remaining }) => {
			const c = contract();
			c.revenues[0].contractRevenueReceivables[0].receivable.receipts = [
				{
					principalAbated: amount(principal),
					effectiveAmount: amount(cash),
					effectiveDate: date,
				},
			];
			db.contract.findFirst.mockResolvedValue(c);
			const result = await getContractById({ scope, id: 5 });
			expect(result.revenues[0]).toMatchObject({
				remainingValue: remaining,
				paidValue: cash,
			});
			expect(
				db.contract.findFirst.mock.calls[0][0].include.revenues.include
					.contractRevenueReceivables.include.receivable.include.receipts.where,
			).toEqual({ reversal: null });
		},
	);
	it("hides movements and balances without independent title authority", async () => {
		const r = await getContractById({
			scope: { ...scope, canReadTitles: false },
			id: 5,
		});
		expect(r.revenues[0]).toMatchObject({
			installments: [],
			paidValue: 0,
			remainingValue: 0,
			isFullyPaid: false,
		});
	});
	it("scopes member reads before mapping and keeps deterministic pagination", async () => {
		await getContracts({
			scope: {
				...scope,
				isAdmin: false,
				employeeId: 10,
				employeeTypeValue: "LAWYER",
			},
			search: { ...contractSearchDefaults, page: 2, limit: 10 },
		});
		const query = db.contract.findMany.mock.calls[0][0];
		expect(query.where.firmId).toBe(1);
		expect(JSON.stringify(query.where.AND)).toContain('"employeeProfileId":10');
		expect(query.skip).toBe(10);
		expect(query.orderBy.at(-1)).toEqual({ id: "asc" });
		expect(db.contract.count).toHaveBeenCalledWith({ where: query.where });
	});
	it("fails safely for an inaccessible contract", async () => {
		db.contract.findFirst.mockResolvedValue(null);
		await expect(getContractById({ scope, id: 999 })).rejects.toThrow();
	});
	it("limits selectable clients and collaborators through the supplied contract scope", async () => {
		const contractWhere = { firmId: 1, id: 7 };
		db.clientProfile.findMany.mockResolvedValue([
			{ id: 9, person: { fullName: "Cliente" } },
		]);
		db.employeeProfile.findMany.mockResolvedValue([
			{ id: 10, person: { fullName: "Advogada" } },
		]);
		expect(await getSelectableContractClients(1, contractWhere)).toEqual([
			{ id: 9, value: "9", label: "Cliente", isDisabled: false },
		]);
		await getSelectableContractEmployees(1, contractWhere);
		expect(db.clientProfile.findMany.mock.calls[0][0].where.contracts).toEqual({
			some: contractWhere,
		});
		expect(
			db.employeeProfile.findMany.mock.calls[0][0].where.assignments.some
				.contract,
		).toEqual(contractWhere);
	});
});
