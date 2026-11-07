import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import type { LoggedUserSession } from "@/shared/session";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";
import {
	createDirectPayable,
	createDirectReceivable,
	generatePayablesFromExpense,
	generateReceivablesFromRevenue,
} from "../data/mutations";
import type { TitleInput } from "../schemas/form";

const { tx, db } = vi.hoisted(() => {
	const tx = {
		$queryRaw: vi.fn(),
		revenue: { findFirst: vi.fn() },
		expense: { findFirst: vi.fn() },
		clientProfile: { findUnique: vi.fn() },
		supplierProfile: { findUnique: vi.fn() },
		financialAnalytic: { findMany: vi.fn() },
		paymentMethod: { findMany: vi.fn() },
		receivable: { create: vi.fn() },
		payable: { create: vi.fn() },
		contractRevenueReceivable: { findFirst: vi.fn(), create: vi.fn() },
		expensePayable: { findFirst: vi.fn(), create: vi.fn() },
		auditLog: { create: vi.fn() },
	};
	return { tx, db: { $transaction: vi.fn() } };
});
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

function session(
	permissions: LoggedUserSession["permissions"] = [
		"org:receivables:create",
		"org:payables:create",
		"org:receivables:generate",
		"org:payables:generate",
		"org:contracts:update_all",
		"org:expenses:update",
	],
): LoggedUserSession {
	return {
		permissions,
		clerk: { userId: "user", organizationId: "org", sessionId: "session" },
		user: { fullName: "Admin", email: "admin@example.com" },
		employee: { id: 10 },
		person: { id: 1000 },
		firm: { id: 1, name: "Matriz" },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	};
}
const profile = {
	id: 30,
	isActive: true,
	person: { isActive: true, deletedAt: null },
};
const titles: TitleInput[] = [
	{
		amount: 0.1,
		dueDate: "2026-12-01",
		analytic: "FEES",
		expectedPaymentMethod: "PIX",
		kind: "DOWN_PAYMENT",
	},
	{
		amount: 0.2,
		dueDate: "2027-01-01",
		analytic: "FEES",
		expectedPaymentMethod: "PIX",
		kind: "INSTALLMENT",
	},
];
const revenue = {
	id: 5,
	firmId: 1,
	contractId: 2,
	negotiatedAmount: new Prisma.Decimal("0.30"),
	contract: {
		id: 2,
		firmId: 1,
		customerId: 30,
		customer: profile,
		status: { value: "ACTIVE" },
		assignments: [
			{
				employeeProfileId: 10,
				employeeProfile: { employeeType: { value: "LAWYER" } },
				assignmentType: { value: "RESPONSIBLE" },
			},
		],
	},
};
const expense = {
	id: 6,
	firmId: 1,
	supplierId: 30,
	negotiatedAmount: new Prisma.Decimal("0.30"),
	supplier: profile,
};
const receivables = (actor = session(), plan = titles) =>
	generateReceivablesFromRevenue({
		session: actor,
		input: { revenueId: 5, titles: plan },
	});
const payables = (actor = session(), plan = titles) =>
	generatePayablesFromExpense({
		session: actor,
		input: { expenseId: 6, titles: plan },
	});
const directInput = { ...titles[0], notes: "  Ajuste manual  " };

beforeEach(() => {
	vi.resetAllMocks();
	db.$transaction.mockImplementation(
		async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
	);
	tx.$queryRaw.mockResolvedValue([{ id: 5 }]);
	tx.revenue.findFirst.mockResolvedValue(revenue);
	tx.expense.findFirst.mockResolvedValue(expense);
	tx.clientProfile.findUnique.mockResolvedValue(profile);
	tx.supplierProfile.findUnique.mockResolvedValue(profile);
	tx.financialAnalytic.findMany.mockResolvedValue([{ id: 8, value: "FEES" }]);
	tx.paymentMethod.findMany.mockResolvedValue([{ id: 9, value: "PIX" }]);
	tx.contractRevenueReceivable.findFirst.mockResolvedValue(null);
	tx.expensePayable.findFirst.mockResolvedValue(null);
	tx.contractRevenueReceivable.create.mockImplementation(async ({ data }) => ({
		id: 20,
		...data,
	}));
	tx.expensePayable.create.mockImplementation(async ({ data }) => ({
		id: 21,
		...data,
	}));
	let nextId = 100;
	tx.receivable.create.mockImplementation(async ({ data }) => ({
		id: nextId++,
		...data,
	}));
	tx.payable.create.mockImplementation(async ({ data }) => ({
		id: nextId++,
		...data,
	}));
});

describe("revenue receivable generation", () => {
	it("locks, closes exact cents and writes scoped titles, bridges and actor audit using transaction client", async () => {
		await expect(receivables()).resolves.toEqual({ success: true });
		expect(db.$transaction).toHaveBeenCalledOnce();
		expect(tx.$queryRaw.mock.calls[0][0].join("?")).toContain(
			"FOR UPDATE OF c, r",
		);
		expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([5, 1]);
		expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
			tx.revenue.findFirst.mock.invocationCallOrder[0],
		);
		expect(tx.revenue.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					id: 5,
					firmId: 1,
					isActive: true,
					deletedAt: null,
				}),
			}),
		);
		expect(tx.receivable.create).toHaveBeenCalledTimes(2);
		const first = tx.receivable.create.mock.calls[0][0].data;
		expect(first).toMatchObject({
			firmId: 1,
			debtorId: 30,
			analyticId: 8,
			expectedPaymentMethodId: 9,
			kind: "DOWN_PAYMENT",
			notes: null,
			dueDate: new Date("2026-12-01T00:00:00Z"),
		});
		expect(first.amount.toString()).toBe("0.1");
		expect(first).not.toHaveProperty("revenueId");
		expect(first).not.toHaveProperty("contractId");
		expect(tx.contractRevenueReceivable.create).toHaveBeenNthCalledWith(1, {
			data: { firmId: 1, contractId: 2, revenueId: 5, receivableId: 100 },
		});
		expect(tx.auditLog.create).toHaveBeenCalledTimes(2);
		expect(tx.auditLog.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				firmId: 1,
				actorId: 1000,
				entityType: "Receivable",
				entityId: "100",
				changeData: {
					after: expect.objectContaining({
						title: expect.objectContaining({ id: 100 }),
						bridge: expect.objectContaining({ revenueId: 5 }),
					}),
				},
			}),
		});
	});
	it("allows assigned contract writes only with both grants", async () => {
		await expect(
			receivables(
				session(["org:receivables:generate", "org:contracts:update_assigned"]),
			),
		).resolves.toEqual({ success: true });
		const unassigned = {
			...session(["org:receivables:generate", "org:contracts:update_assigned"]),
			employee: { id: 999 },
		};
		await expect(receivables(unassigned)).rejects.toThrow("permissão");
	});
	it.each(["COMPLETED", "CANCELLED"])("rejects %s contracts", async (value) => {
		tx.revenue.findFirst.mockResolvedValue({
			...revenue,
			contract: { ...revenue.contract, status: { value } },
		});
		await expect(receivables()).rejects.toThrow("permissão");
		expect(tx.receivable.create).not.toHaveBeenCalled();
	});
	it("rejects missing operational permission without writes", async () => {
		await expect(
			receivables(session(["org:receivables:generate"])),
		).rejects.toThrow("permissão");
		expect(tx.receivable.create).not.toHaveBeenCalled();
	});
});

describe("expense payable generation", () => {
	it("writes supplier titles and expense bridges with audits", async () => {
		await expect(payables()).resolves.toEqual({ success: true });
		expect(tx.$queryRaw.mock.calls[0][0].join("?")).toContain("FOR UPDATE");
		expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([6, 1]);
		expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
			tx.expense.findFirst.mock.invocationCallOrder[0],
		);
		expect(tx.expense.findFirst).toHaveBeenCalledWith({
			where: { id: 6, firmId: 1, isActive: true, deletedAt: null },
			select: {
				id: true,
				supplierId: true,
				negotiatedAmount: true,
				supplier: {
					select: {
						isActive: true,
						person: { select: { isActive: true, deletedAt: true } },
					},
				},
			},
		});
		expect(tx.payable.create).toHaveBeenCalledTimes(2);
		expect(tx.payable.create.mock.calls[0][0].data).toMatchObject({
			firmId: 1,
			beneficiaryId: 30,
			kind: "DOWN_PAYMENT",
		});
		expect(tx.payable.create.mock.calls[0][0].data).not.toHaveProperty(
			"expenseId",
		);
		expect(tx.expensePayable.create).toHaveBeenNthCalledWith(1, {
			data: { firmId: 1, expenseId: 6, payableId: 100 },
		});
		expect(tx.auditLog.create).toHaveBeenCalledTimes(2);
	});
	it("accepts expense create grant and rejects missing operational authority", async () => {
		await expect(
			payables(session(["org:payables:generate", "org:expenses:create"])),
		).resolves.toEqual({ success: true });
		await expect(payables(session(["org:payables:generate"]))).rejects.toThrow(
			"permissão",
		);
	});
});

describe.each([
	{
		direction: "receivables",
		run: receivables,
		source: tx.revenue,
		bridge: tx.contractRevenueReceivable,
		title: tx.receivable,
		unavailable: FINANCIAL_TITLE_ERRORS.REVENUE_UNAVAILABLE,
	},
	{
		direction: "payables",
		run: payables,
		source: tx.expense,
		bridge: tx.expensePayable,
		title: tx.payable,
		unavailable: FINANCIAL_TITLE_ERRORS.EXPENSE_UNAVAILABLE,
	},
])(
	"generation safety: $direction",
	({ run, source, bridge, title, unavailable }) => {
		it("denies missing title permission before transaction", async () => {
			await expect(run(session([]))).rejects.toThrow("permissão");
			expect(db.$transaction).not.toHaveBeenCalled();
		});
		it("rejects out-of-firm, deleted or inactive source without writes", async () => {
			source.findFirst.mockResolvedValue(null);
			await expect(run()).rejects.toThrow(unavailable);
			expect(title.create).not.toHaveBeenCalled();
		});
		it("rejects one-cent mismatch without writes", async () => {
			await expect(
				run(session(), [{ ...titles[0], amount: 0.29 }]),
			).rejects.toThrow(FINANCIAL_TITLE_ERRORS.CLOSURE_BALANCE_MISMATCH);
			expect(title.create).not.toHaveBeenCalled();
			expect(bridge.create).not.toHaveBeenCalled();
			expect(tx.auditLog.create).not.toHaveBeenCalled();
		});
		it("rejects previously bridged origins, including cancelled history", async () => {
			bridge.findFirst.mockResolvedValue({ id: 20 });
			await expect(run()).rejects.toThrow(
				FINANCIAL_TITLE_ERRORS.ALREADY_GENERATED,
			);
			expect(title.create).not.toHaveBeenCalled();
		});
		it("rejects unavailable analytic before writes", async () => {
			tx.financialAnalytic.findMany.mockResolvedValue([]);
			await expect(run()).rejects.toThrow(
				FINANCIAL_TITLE_ERRORS.ANALYTIC_UNAVAILABLE,
			);
			expect(title.create).not.toHaveBeenCalled();
		});
		it("rejects unavailable payment method before writes", async () => {
			tx.paymentMethod.findMany.mockResolvedValue([]);
			await expect(run()).rejects.toThrow(
				FINANCIAL_TITLE_ERRORS.PAYMENT_METHOD_UNAVAILABLE,
			);
			expect(title.create).not.toHaveBeenCalled();
		});
		it.each(["title", "bridge", "audit"])(
			"aborts transaction when %s persistence fails",
			async (stage) => {
				const failure = new Error("database unavailable");
				(stage === "title"
					? title.create
					: stage === "bridge"
						? bridge.create
						: tx.auditLog.create
				).mockRejectedValueOnce(failure);
				await expect(run()).rejects.toBe(failure);
				expect(title.create).toHaveBeenCalledOnce();
			},
		);
	},
);

describe("counterparty and direct titles", () => {
	it("keeps generation grants independent of direct creation grants", async () => {
		await expect(
			receivables(
				session(["org:receivables:create", "org:contracts:update_all"]),
			),
		).rejects.toThrow("permissão");
		await expect(
			payables(session(["org:payables:create", "org:expenses:update"])),
		).rejects.toThrow("permissão");
		await expect(
			createDirectReceivable({
				session: session([
					"org:receivables:generate",
					"org:contracts:update_assigned",
				]),
				input: { ...directInput, debtorId: 30 },
			}),
		).rejects.toThrow("permissão");
		await expect(
			createDirectPayable({
				session: session(["org:payables:generate"]),
				input: { ...directInput, beneficiaryId: 30 },
			}),
		).rejects.toThrow("permissão");
		expect(db.$transaction).not.toHaveBeenCalled();
	});
	it("rejects inactive revenue debtor and deleted expense supplier", async () => {
		tx.revenue.findFirst.mockResolvedValue({
			...revenue,
			contract: {
				...revenue.contract,
				customer: { ...profile, isActive: false },
			},
		});
		tx.expense.findFirst.mockResolvedValue({
			...expense,
			supplier: {
				...profile,
				person: { isActive: true, deletedAt: new Date() },
			},
		});
		await expect(receivables()).rejects.toThrow(
			FINANCIAL_TITLE_ERRORS.COUNTERPARTY_UNAVAILABLE,
		);
		await expect(payables()).rejects.toThrow(
			FINANCIAL_TITLE_ERRORS.COUNTERPARTY_UNAVAILABLE,
		);
		expect(tx.receivable.create).not.toHaveBeenCalled();
		expect(tx.payable.create).not.toHaveBeenCalled();
	});
	it("creates direct titles with global profiles, trimmed notes and no bridges", async () => {
		await expect(
			createDirectReceivable({
				session: session(),
				input: { ...directInput, debtorId: 30 },
			}),
		).resolves.toEqual({ success: true });
		await expect(
			createDirectPayable({
				session: session(),
				input: { ...directInput, beneficiaryId: 30 },
			}),
		).resolves.toEqual({ success: true });
		expect(tx.clientProfile.findUnique).toHaveBeenCalledWith({
			where: { id: 30 },
			select: {
				isActive: true,
				person: { select: { isActive: true, deletedAt: true } },
			},
		});
		expect(tx.receivable.create.mock.calls[0][0].data).toMatchObject({
			firmId: 1,
			debtorId: 30,
			notes: "Ajuste manual",
		});
		expect(tx.payable.create.mock.calls[0][0].data).toMatchObject({
			firmId: 1,
			beneficiaryId: 30,
			notes: "Ajuste manual",
		});
		expect(tx.contractRevenueReceivable.create).not.toHaveBeenCalled();
		expect(tx.expensePayable.create).not.toHaveBeenCalled();
		expect(tx.auditLog.create).toHaveBeenCalledTimes(2);
	});
	it("rejects missing/inactive profiles and missing direct grants", async () => {
		tx.clientProfile.findUnique.mockResolvedValue(null);
		tx.supplierProfile.findUnique.mockResolvedValue({
			...profile,
			isActive: false,
		});
		await expect(
			createDirectReceivable({
				session: session(),
				input: { ...directInput, debtorId: 30 },
			}),
		).rejects.toThrow(FINANCIAL_TITLE_ERRORS.COUNTERPARTY_UNAVAILABLE);
		await expect(
			createDirectPayable({
				session: session(),
				input: { ...directInput, beneficiaryId: 30 },
			}),
		).rejects.toThrow(FINANCIAL_TITLE_ERRORS.COUNTERPARTY_UNAVAILABLE);
		await expect(
			createDirectReceivable({
				session: session(["org:contracts:update_assigned"]),
				input: { ...directInput, debtorId: 30 },
			}),
		).rejects.toThrow("permissão");
		await expect(
			createDirectPayable({
				session: session(["org:payables:read_own"]),
				input: { ...directInput, beneficiaryId: 30 },
			}),
		).rejects.toThrow("permissão");
		expect(tx.receivable.create).not.toHaveBeenCalled();
		expect(tx.payable.create).not.toHaveBeenCalled();
	});
	it("revalidates direct notes before transaction", async () => {
		await expect(
			createDirectReceivable({
				session: session(),
				input: { ...directInput, debtorId: 30, notes: " " },
			}),
		).rejects.toThrow(FINANCIAL_TITLE_ERRORS.NOTES_REQUIRED);
		await expect(
			createDirectPayable({
				session: session(),
				input: { ...directInput, beneficiaryId: 30, notes: " " },
			}),
		).rejects.toThrow(FINANCIAL_TITLE_ERRORS.NOTES_REQUIRED);
		expect(db.$transaction).not.toHaveBeenCalled();
	});
});
