import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import type { LoggedUserSession } from "@/shared/session";
import { SETTLEMENT_ERRORS } from "../constants/errors";
import { createSettlement, reverseSettlement } from "../data/mutations";
import type {
	SettlementCreateInput,
	SettlementReverseInput,
} from "../schemas/form";

const { tx, db, audit } = vi.hoisted(() => {
	const tx = {
		$queryRaw: vi.fn(),
		receivable: { findFirst: vi.fn(), findFirstOrThrow: vi.fn() },
		payable: {
			findFirst: vi.fn(),
			findFirstOrThrow: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
		},
		receipt: { findFirst: vi.fn(), aggregate: vi.fn(), create: vi.fn() },
		payment: { findFirst: vi.fn(), aggregate: vi.fn(), create: vi.fn() },
		receiptReversal: { create: vi.fn() },
		paymentReversal: { create: vi.fn() },
		paymentMethod: { findUnique: vi.fn() },
		contractRevenueReceivable: { findFirst: vi.fn() },
		remunerationPayable: { findMany: vi.fn(), create: vi.fn() },
		firm: { findUniqueOrThrow: vi.fn() },
		financialAnalytic: { findFirst: vi.fn() },
	};
	return { tx, db: { $transaction: vi.fn() }, audit: vi.fn() };
});
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));
vi.mock("@/features/audit-logs", () => ({ createAuditLog: audit }));

const decimal = (value: number | string) => new Prisma.Decimal(value);
function session(
	permissions: LoggedUserSession["permissions"] = [
		"org:receipts:create",
		"org:receipts:read_all",
		"org:receipts:reverse",
		"org:payments:create",
		"org:payments:reverse",
	],
): LoggedUserSession {
	return {
		permissions,
		firm: { id: 1, name: "Matriz" },
		person: { id: 100 },
		employee: { id: 10 },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
		user: { fullName: "Operador", email: "operator@example.com" },
		clerk: { userId: "user_a", organizationId: "org_a", sessionId: "sess_a" },
	};
}
const input: SettlementCreateInput = {
	direction: "receivable",
	titleId: 5,
	requestKey: "e0606906-6993-4135-96da-12b147290044",
	effectiveDate: "2026-10-25",
	actualPaymentMethod: "PIX",
	principalAbated: 40,
	discount: 5,
	interest: 2,
	penalty: 1,
	generatesRemuneration: false,
};
const reversal: SettlementReverseInput = {
	direction: "receivable",
	titleId: 5,
	movementId: 20,
	requestKey: "e0606906-6993-4135-96da-12b147290045",
	effectiveDate: "2026-10-26",
	reason: "Correção de lançamento",
};
const movement = () => ({
	id: 20,
	firmId: 1,
	actorId: 100,
	receivableId: 5,
	requestKey: input.requestKey,
	actualPaymentMethodId: 3,
	effectiveDate: new Date("2026-10-25T00:00:00Z"),
	principalAbated: decimal(40),
	discount: decimal(5),
	interest: decimal(2),
	penalty: decimal(1),
	effectiveAmount: decimal(38),
	generatesRemuneration: false,
	reversal: null,
});
const assignment = (id: number, kind = "RESPONSIBLE", percentage = "0.30") => ({
	id,
	assignmentType: { value: kind },
	employeeProfile: {
		isActive: true,
		deletedAt: null,
		remunerationPercentage: decimal(percentage),
		referralPercentage: decimal("0.10"),
		employeeType: { value: "LAWYER" },
		person: {
			isActive: true,
			deletedAt: null,
			supplierProfile: { id: 80 + id, isActive: true },
		},
	},
});

beforeEach(() => {
	vi.resetAllMocks();
	db.$transaction.mockImplementation(
		async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
	);
	const title = {
		id: 5,
		amount: decimal(100),
		cancelledAt: null,
		contractRevenueReceivable: null,
	};
	tx.receivable.findFirst.mockResolvedValue(title);
	tx.payable.findFirst.mockResolvedValue(title);
	tx.receivable.findFirstOrThrow.mockResolvedValue(title);
	tx.payable.findFirstOrThrow.mockResolvedValue(title);
	tx.paymentMethod.findUnique.mockResolvedValue({ id: 3, isActive: true });
	tx.receipt.aggregate.mockResolvedValue({
		_sum: { principalAbated: decimal(20) },
	});
	tx.payment.aggregate.mockResolvedValue({
		_sum: { principalAbated: decimal(20) },
	});
	tx.receipt.create.mockImplementation(async ({ data }) => ({
		id: 20,
		...data,
	}));
	tx.payment.create.mockImplementation(async ({ data }) => ({
		id: 30,
		...data,
	}));
	tx.payable.create.mockResolvedValue({ id: 50 });
	tx.payable.update.mockImplementation(async ({ where, data }) => ({
		id: where.firmId_id.id,
		...data,
	}));
	tx.remunerationPayable.findMany.mockResolvedValue([]);
	tx.firm.findUniqueOrThrow.mockResolvedValue({
		remunerationCutoffDay: 25,
		remunerationDueDay: 5,
	});
	tx.financialAnalytic.findFirst.mockResolvedValue({ id: 9 });
});

describe("financial settlements", () => {
	it("serializes competing settlements before reading remaining balance", async () => {
		let total = decimal(0);
		let lockTail = Promise.resolve();
		db.$transaction.mockImplementation(
			async (callback: (client: typeof tx) => Promise<unknown>) => {
				let release = () => {};
				const client = {
					...tx,
					$queryRaw: vi.fn(async () => {
						const previous = lockTail;
						lockTail = new Promise<void>((resolve) => {
							release = resolve;
						});
						await previous;
					}),
				};
				try {
					return await callback(client);
				} finally {
					release();
				}
			},
		);
		tx.receipt.aggregate.mockImplementation(async () => ({
			_sum: { principalAbated: total },
		}));
		tx.receipt.create.mockImplementation(async ({ data }) => {
			total = total.plus(data.principalAbated);
			return { id: 20, ...data };
		});
		const results = await Promise.allSettled([
			createSettlement(session(), { ...input, principalAbated: 60 }),
			createSettlement(session(), {
				...input,
				principalAbated: 60,
				requestKey: "e0606906-6993-4135-96da-12b147290046",
			}),
		]);
		expect(results.map((result) => result.status)).toEqual([
			"fulfilled",
			"rejected",
		]);
		expect(total.toString()).toBe("60");
		expect(tx.receipt.create).toHaveBeenCalledOnce();
	});
	it.each(["receivable", "payable"] as const)(
		"records %s cash separately from principal with tenant and actor from session",
		async (direction) => {
			await createSettlement(session(), { ...input, direction });
			const model = direction === "receivable" ? tx.receipt : tx.payment;
			const data = model.create.mock.calls[0][0].data;
			expect(data.effectiveAmount.toString()).toBe("38");
			expect(data.principalAbated.toString()).toBe("40");
			expect(data).toMatchObject({
				firmId: 1,
				actorId: 100,
				actualPaymentMethodId: 3,
			});
			expect(model.aggregate).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ firmId: 1, reversal: null }),
				}),
			);
			expect(tx.$queryRaw.mock.calls[0][0].sql).toContain("FOR UPDATE");
			expect(tx.$queryRaw.mock.calls[0][0].values).toEqual([5, 1]);
			expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
				model.aggregate.mock.invocationCallOrder[0],
			);
			expect(audit).toHaveBeenCalledWith(
				tx,
				expect.objectContaining({ action: "SETTLE", entityId: 5, firmId: 1 }),
			);
		},
	);
	it("rejects over-settlement using the latest persisted principal", async () => {
		tx.receipt.aggregate.mockResolvedValue({
			_sum: { principalAbated: decimal(70) },
		});
		await expect(createSettlement(session(), input)).rejects.toThrow(
			SETTLEMENT_ERRORS.BALANCE,
		);
		expect(tx.receipt.create).not.toHaveBeenCalled();
		expect(audit).not.toHaveBeenCalled();
	});
	it("rejects cancelled titles and inactive methods", async () => {
		tx.receivable.findFirstOrThrow.mockResolvedValue({
			amount: decimal(100),
			cancelledAt: new Date(),
		});
		await expect(createSettlement(session(), input)).rejects.toThrow(
			SETTLEMENT_ERRORS.CANCELLED,
		);
		tx.paymentMethod.findUnique.mockResolvedValue({ id: 3, isActive: false });
		await expect(createSettlement(session(), input)).rejects.toThrow(
			SETTLEMENT_ERRORS.METHOD,
		);
		expect(tx.receipt.create).not.toHaveBeenCalled();
	});
	it("retries an identical confirmed request without another movement or audit", async () => {
		tx.receipt.findFirst.mockResolvedValue(movement());
		await expect(createSettlement(session(), input)).resolves.toEqual({
			success: true,
		});
		expect(tx.receipt.create).not.toHaveBeenCalled();
		expect(tx.receipt.aggregate).not.toHaveBeenCalled();
		expect(audit).not.toHaveBeenCalled();
		await expect(
			createSettlement(session(), { ...input, principalAbated: 41 }),
		).rejects.toThrow(SETTLEMENT_ERRORS.RETRY);
	});
	it("denies missing grants and foreign-firm titles", async () => {
		await expect(createSettlement(session([]), input)).rejects.toThrow(
			"Você não tem permissão",
		);
		tx.receivable.findFirst.mockResolvedValue(null);
		await expect(createSettlement(session(), input)).rejects.toThrow(
			SETTLEMENT_ERRORS.UNAVAILABLE,
		);
		expect(tx.receivable.findFirst).toHaveBeenLastCalledWith(
			expect.objectContaining({ where: { id: 5, firmId: 1 } }),
		);
		expect(tx.receipt.create).not.toHaveBeenCalled();
	});
	it("allows explicitly authorized assigned members without depending on operational lifecycle", async () => {
		tx.receivable.findFirst.mockResolvedValue({
			contractRevenueReceivable: {
				contract: {
					assignments: [
						{
							employeeProfileId: 10,
							employeeProfile: { employeeType: { value: "LAWYER" } },
							assignmentType: { value: "RESPONSIBLE" },
						},
					],
				},
			},
		});
		const member = session([
			"org:receipts:create",
			"org:receipts:read_assigned",
		]);
		await expect(createSettlement(member, input)).resolves.toEqual({
			success: true,
		});
		member.employee.id = 99;
		await expect(createSettlement(member, input)).rejects.toThrow(
			"Você não tem permissão",
		);
	});
	it("propagates audit failure out of the financial transaction", async () => {
		audit.mockRejectedValue(new Error("audit unavailable"));
		await expect(createSettlement(session(), input)).rejects.toThrow(
			"audit unavailable",
		);
		expect(db.$transaction).toHaveBeenCalledOnce();
	});
});

describe("remuneration side effects", () => {
	it("generates supplier payables with cent rounding, snapshots and cutoff due date", async () => {
		tx.contractRevenueReceivable.findFirst.mockResolvedValue({
			id: 1,
			contract: {
				assignments: [
					assignment(1),
					assignment(2, "RECOMMENDING"),
					assignment(3, "RECOMMENDED"),
				],
			},
		});
		await createSettlement(session(), {
			...input,
			generatesRemuneration: true,
		});
		expect(
			tx.payable.create.mock.calls.map(([args]) => args.data.amount.toString()),
		).toEqual(["11.4", "3.8", "7.6"]);
		expect(tx.payable.create.mock.calls[0][0].data).toMatchObject({
			beneficiaryId: 81,
			firmId: 1,
			analyticId: 9,
			dueDate: new Date("2026-11-05T00:00:00Z"),
		});
		expect(tx.remunerationPayable.create.mock.calls[0][0].data).toMatchObject({
			receiptId: 20,
			contractAssignmentId: 1,
			ruleSnapshot: expect.objectContaining({
				cutoffDay: 25,
				remunerationPercentage: "0.3",
			}),
		});
		expect(audit).toHaveBeenCalledTimes(4);
	});
	it("allows full discount with no cash and no generated remuneration", async () => {
		tx.contractRevenueReceivable.findFirst.mockResolvedValue({ id: 1 });
		await createSettlement(session(), {
			...input,
			generatesRemuneration: true,
			discount: 40,
			interest: 0,
			penalty: 0,
		});
		expect(
			tx.receipt.create.mock.calls[0][0].data.effectiveAmount.toString(),
		).toBe("0");
		expect(tx.payable.create).not.toHaveBeenCalled();
	});
	it("rejects remuneration for direct titles and unavailable suppliers", async () => {
		await expect(
			createSettlement(session(), { ...input, generatesRemuneration: true }),
		).rejects.toThrow(SETTLEMENT_ERRORS.REMUNERATION);
		const item = assignment(1);
		item.employeeProfile.person.supplierProfile.isActive = false;
		tx.contractRevenueReceivable.findFirst.mockResolvedValue({
			id: 1,
			contract: { assignments: [item] },
		});
		await expect(
			createSettlement(session(), { ...input, generatesRemuneration: true }),
		).rejects.toThrow(SETTLEMENT_ERRORS.REMUNERATION);
		expect(tx.remunerationPayable.create).not.toHaveBeenCalled();
	});
});

describe("immutable reversals", () => {
	it.each(["receivable", "payable"] as const)(
		"reverses one %s movement, preserving original event",
		async (direction) => {
			const model = direction === "receivable" ? tx.receipt : tx.payment;
			model.findFirst.mockResolvedValue(movement());
			await reverseSettlement(session(), { ...reversal, direction });
			const reversalModel =
				direction === "receivable" ? tx.receiptReversal : tx.paymentReversal;
			expect(reversalModel.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					firmId: 1,
					reason: reversal.reason,
					actorId: 100,
				}),
			});
			expect(audit).toHaveBeenCalledWith(
				tx,
				expect.objectContaining({ entityId: 5, action: "REVERSE" }),
			);
			expect(model.create).not.toHaveBeenCalled();
		},
	);
	it("blocks receipt reversal when any remuneration has an active payment", async () => {
		tx.receipt.findFirst.mockResolvedValue(movement());
		tx.remunerationPayable.findMany.mockResolvedValue([
			{ payableId: 40 },
			{ payableId: 50 },
		]);
		tx.payment.findFirst.mockResolvedValue({ id: 90 });
		await expect(reverseSettlement(session(), reversal)).rejects.toThrow(
			SETTLEMENT_ERRORS.DEPENDENCY,
		);
		expect(tx.$queryRaw.mock.calls.map(([query]) => query.values)).toEqual([
			[5, 1],
			[40, 1],
			[50, 1],
		]);
		expect(tx.payment.findFirst).toHaveBeenCalledWith({
			where: { firmId: 1, payableId: 40, reversal: null },
			select: { id: true },
		});
		expect(tx.payable.update).not.toHaveBeenCalled();
		expect(tx.receiptReversal.create).not.toHaveBeenCalled();
	});
	it("cancels generated payables after dependent payments were reversed", async () => {
		tx.receipt.findFirst.mockResolvedValue(movement());
		tx.remunerationPayable.findMany.mockResolvedValue([{ payableId: 40 }]);
		await reverseSettlement(session(), reversal);
		expect(tx.payable.update).toHaveBeenCalledWith({
			where: { firmId_id: { firmId: 1, id: 40 } },
			data: {
				cancelledAt: expect.any(Date),
				cancellationReason: reversal.reason,
			},
		});
		expect(tx.receiptReversal.create).toHaveBeenCalledOnce();
	});
	it("retries identical reversal but rejects a second reversal and dates before original", async () => {
		tx.receipt.findFirst.mockResolvedValue({
			...movement(),
			reversal: {
				requestKey: reversal.requestKey,
				reason: reversal.reason,
				effectiveDate: new Date("2026-10-26T00:00:00Z"),
				actorId: 100,
			},
		});
		await expect(reverseSettlement(session(), reversal)).resolves.toEqual({
			success: true,
		});
		expect(tx.receiptReversal.create).not.toHaveBeenCalled();
		await expect(
			reverseSettlement(session(), { ...reversal, reason: "Outro motivo" }),
		).rejects.toThrow(SETTLEMENT_ERRORS.REVERSED);
		tx.receipt.findFirst.mockResolvedValue(movement());
		await expect(
			reverseSettlement(session(), {
				...reversal,
				effectiveDate: "2026-10-24",
			}),
		).rejects.toThrow(SETTLEMENT_ERRORS.DATE);
	});
	it("rejects movement from another title and missing reversal grant", async () => {
		await expect(
			reverseSettlement(session(["org:receipts:create"]), reversal),
		).rejects.toThrow("Você não tem permissão");
		tx.receipt.findFirst.mockResolvedValue(null);
		await expect(reverseSettlement(session(), reversal)).rejects.toThrow(
			SETTLEMENT_ERRORS.UNAVAILABLE,
		);
		expect(tx.receipt.findFirst).toHaveBeenLastCalledWith({
			where: { id: 20, receivableId: 5, firmId: 1 },
			include: { reversal: true },
		});
	});
});
