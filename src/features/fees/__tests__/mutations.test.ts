import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const { createAuditLogMock, prismaMock } = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	prismaMock: {
		revenue: {
			findFirst: vi.fn(),
		},
		$transaction: vi.fn(),
		fee: {
			create: vi.fn(),
			update: vi.fn(),
		},
		remuneration: {
			findMany: vi.fn(),
			updateMany: vi.fn(),
			createMany: vi.fn(),
		},
		contract: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
		contractStatus: {
			findUnique: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
}));

import { FEE_ERRORS } from "../constants/errors";
import { createFee, deleteFee, restoreFee, updateFee } from "../data/mutations";

const responsibleAssignment = {
	id: 100,
	employeeId: 10,
	employee: {
		referralPercentage: new Prisma.Decimal("0.10"),
		remunerationPercentage: new Prisma.Decimal("0.30"),
	},
	assignmentType: {
		value: "RESPONSIBLE",
	},
};

const recommendingAssignment = {
	id: 101,
	employeeId: 11,
	employee: {
		referralPercentage: new Prisma.Decimal("0.10"),
		remunerationPercentage: new Prisma.Decimal("0.20"),
	},
	assignmentType: {
		value: "RECOMMENDING",
	},
};

const recommendedAssignment = {
	id: 102,
	employeeId: 12,
	employee: {
		referralPercentage: new Prisma.Decimal("0.00"),
		remunerationPercentage: new Prisma.Decimal("0.25"),
	},
	assignmentType: {
		value: "RECOMMENDED",
	},
};

const writableRevenue = {
	id: 5,
	firmId: 1,
	contractId: 3,
	totalInstallments: 2,
	contract: {
		assignments: [
			responsibleAssignment,
			recommendingAssignment,
			recommendedAssignment,
		],
	},
	fees: [
		{
			id: 50,
			installmentNumber: 1,
			isActive: true,
			deletedAt: null,
		},
	],
};

describe("fee data mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.revenue.findFirst.mockResolvedValue(writableRevenue);
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
		prismaMock.fee.create.mockResolvedValue({
			id: 6,
			installmentNumber: 2,
		});
		prismaMock.fee.update.mockResolvedValue({});
		prismaMock.remuneration.findMany.mockResolvedValue([]);
		prismaMock.remuneration.updateMany.mockResolvedValue({});
		prismaMock.remuneration.createMany.mockResolvedValue({});
		prismaMock.contract.findUnique.mockResolvedValue({
			id: 3,
			allowStatusChange: true,
			status: { value: "ACTIVE" },
			revenues: [
				{
					totalValue: "2000",
					downPaymentValue: "0",
					fees: [{ amount: "2000" }],
				},
			],
		});
		prismaMock.contractStatus.findUnique.mockResolvedValue({ id: 90 });
		prismaMock.contract.update.mockResolvedValue({});
	});

	it("creates fees transactionally, generates remunerations, syncs contract status, and audits", async () => {
		await expect(
			createFee({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				scope: { firmId: 1 },
				input: {
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-15",
					amount: 1000,
					installmentNumber: 2,
					generatesRemuneration: true,
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.revenue.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: 5,
					deletedAt: null,
					firmId: 1,
				},
			}),
		);
		expect(prismaMock.$transaction).toHaveBeenCalledOnce();
		expect(prismaMock.fee.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				firmId: 1,
				revenueId: 5,
				amount: 1000,
				installmentNumber: 2,
				generatesRemuneration: true,
				isActive: true,
			}),
		});
		expect(prismaMock.remuneration.updateMany).toHaveBeenCalledWith({
			where: {
				feeId: 6,
				deletedAt: null,
				isSystemGenerated: true,
			},
			data: {
				deletedAt: expect.any(Date),
			},
		});
		expect(prismaMock.remuneration.createMany).toHaveBeenCalledWith({
			data: expect.arrayContaining([
				expect.objectContaining({
					firmId: 1,
					feeId: 6,
					contractEmployeeId: responsibleAssignment.id,
					isSystemGenerated: true,
					isActive: true,
				}),
				expect.objectContaining({
					contractEmployeeId: recommendingAssignment.id,
				}),
				expect.objectContaining({
					contractEmployeeId: recommendedAssignment.id,
				}),
			]),
		});
		expect(prismaMock.contractStatus.findUnique).toHaveBeenCalledWith({
			where: { value: "COMPLETED" },
			select: { id: true },
		});
		expect(prismaMock.contract.update).toHaveBeenCalledWith({
			where: { id: 3 },
			data: { statusId: 90 },
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "CREATE",
				entityType: "Fee",
				entityId: 6,
				entityName: "Installment 2",
			}),
		);
	});

	it("blocks creation when a revenue already has all expected installments", async () => {
		prismaMock.revenue.findFirst.mockResolvedValue({
			...writableRevenue,
			totalInstallments: 1,
		});

		await expect(
			createFee({
				scope: { firmId: 1 },
				input: {
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-15",
					amount: 1000,
					installmentNumber: 2,
					generatesRemuneration: true,
					isActive: true,
				},
			}),
		).rejects.toThrow(FEE_ERRORS.FEE_CONTRACT_EXHAUSTED);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(prismaMock.fee.create).not.toHaveBeenCalled();
	});

	it("preserves manual remuneration overrides during fee recalculation", async () => {
		prismaMock.remuneration.findMany.mockResolvedValue([
			{
				id: 200,
				contractEmployeeId: responsibleAssignment.id,
				isSystemGenerated: false,
			},
			{
				id: 201,
				contractEmployeeId: recommendedAssignment.id,
				isSystemGenerated: true,
			},
		]);

		await expect(
			updateFee({
				scope: { firmId: 1 },
				access: {
					id: 6,
					resource: {
						firmId: 1,
						assignedEmployeeIds: [],
						statusValue: "ACTIVE",
						allowStatusChange: true,
					},
					contractId: 3,
					revenueId: 5,
					deletedAt: null,
					generatesRemuneration: true,
					manualRemunerationCount: 0,
					remunerationCount: 2,
				},
				input: {
					id: 6,
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-15",
					amount: 1000,
					installmentNumber: 2,
					generatesRemuneration: true,
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.remuneration.updateMany).toHaveBeenCalledWith({
			where: {
				feeId: 6,
				deletedAt: null,
				isSystemGenerated: true,
			},
			data: {
				deletedAt: expect.any(Date),
			},
		});
		expect(prismaMock.remuneration.createMany).toHaveBeenCalledWith({
			data: expect.not.arrayContaining([
				expect.objectContaining({
					contractEmployeeId: responsibleAssignment.id,
				}),
			]),
		});
		expect(prismaMock.remuneration.createMany).toHaveBeenCalledWith({
			data: expect.arrayContaining([
				expect.objectContaining({
					contractEmployeeId: recommendingAssignment.id,
				}),
				expect.objectContaining({
					contractEmployeeId: recommendedAssignment.id,
				}),
			]),
		});
	});

	it("blocks reparenting when the fee has manual remuneration overrides", async () => {
		await expect(
			updateFee({
				scope: { firmId: 1 },
				access: {
					id: 6,
					resource: {
						firmId: 1,
						assignedEmployeeIds: [],
						statusValue: "ACTIVE",
						allowStatusChange: true,
					},
					contractId: 3,
					revenueId: 4,
					deletedAt: null,
					generatesRemuneration: true,
					manualRemunerationCount: 1,
					remunerationCount: 1,
				},
				input: {
					id: 6,
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-15",
					amount: 1000,
					installmentNumber: 2,
					generatesRemuneration: true,
					isActive: true,
				},
			}),
		).rejects.toThrow(FEE_ERRORS.FEE_REPARENT_MANUAL_OVERRIDE_BLOCKED);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("blocks reparenting when remunerations must be preserved with generation disabled", async () => {
		await expect(
			updateFee({
				scope: { firmId: 1 },
				access: {
					id: 6,
					resource: {
						firmId: 1,
						assignedEmployeeIds: [],
						statusValue: "ACTIVE",
						allowStatusChange: true,
					},
					contractId: 3,
					revenueId: 4,
					deletedAt: null,
					generatesRemuneration: true,
					manualRemunerationCount: 0,
					remunerationCount: 2,
				},
				input: {
					id: 6,
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-15",
					amount: 1000,
					installmentNumber: 2,
					generatesRemuneration: false,
					isActive: true,
				},
			}),
		).rejects.toThrow(FEE_ERRORS.FEE_REPARENT_PRESERVE_BLOCKED);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("keeps existing remunerations unchanged when generation is disabled on update", async () => {
		await expect(
			updateFee({
				scope: { firmId: 1 },
				access: {
					id: 6,
					resource: {
						firmId: 1,
						assignedEmployeeIds: [],
						statusValue: "ACTIVE",
						allowStatusChange: true,
					},
					contractId: 3,
					revenueId: 5,
					deletedAt: null,
					generatesRemuneration: true,
					manualRemunerationCount: 0,
					remunerationCount: 2,
				},
				input: {
					id: 6,
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-20",
					amount: 900,
					installmentNumber: 2,
					generatesRemuneration: false,
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.remuneration.findMany).not.toHaveBeenCalled();
		expect(prismaMock.remuneration.updateMany).not.toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					feeId: 6,
					isSystemGenerated: true,
				}),
			}),
		);
		expect(prismaMock.remuneration.createMany).not.toHaveBeenCalled();
	});

	it("soft-deletes and restores linked remunerations when fee lifecycle changes", async () => {
		await expect(
			deleteFee({
				firmId: 1,
				id: 6,
				contractId: 3,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.fee.update).toHaveBeenCalledWith({
			where: { id: 6 },
			data: { deletedAt: expect.any(Date) },
		});
		expect(prismaMock.remuneration.updateMany).toHaveBeenCalledWith({
			where: { feeId: 6 },
			data: { deletedAt: expect.any(Date) },
		});

		vi.clearAllMocks();
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);

		await expect(
			restoreFee({
				firmId: 1,
				id: 6,
				contractId: 3,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.fee.update).toHaveBeenCalledWith({
			where: { id: 6 },
			data: { deletedAt: null },
		});
		expect(prismaMock.remuneration.updateMany).toHaveBeenCalledWith({
			where: { feeId: 6 },
			data: { deletedAt: null },
		});
	});

	it("returns contracts to active status when delete or restore leaves them not fully paid", async () => {
		prismaMock.contract.findUnique.mockResolvedValue({
			id: 3,
			allowStatusChange: true,
			status: { value: "COMPLETED" },
			revenues: [
				{
					totalValue: "2000",
					downPaymentValue: "0",
					fees: [{ amount: "1000" }],
				},
			],
		});
		prismaMock.contractStatus.findUnique.mockResolvedValue({ id: 10 });

		await expect(
			deleteFee({
				firmId: 1,
				id: 6,
				contractId: 3,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.contractStatus.findUnique).toHaveBeenCalledWith({
			where: { value: "ACTIVE" },
			select: { id: true },
		});
		expect(prismaMock.contract.update).toHaveBeenCalledWith({
			where: { id: 3 },
			data: { statusId: 10 },
		});
	});

	it("does not auto-transition contract status when status changes are locked", async () => {
		prismaMock.contract.findUnique.mockResolvedValue({
			id: 3,
			allowStatusChange: false,
			status: { value: "ACTIVE" },
			revenues: [
				{
					totalValue: "2000",
					downPaymentValue: "0",
					fees: [{ amount: "2000" }],
				},
			],
		});

		await expect(
			createFee({
				scope: { firmId: 1 },
				input: {
					contractId: "3",
					revenueId: "5",
					paymentDate: "2026-01-15",
					amount: 1000,
					installmentNumber: 2,
					generatesRemuneration: false,
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.contractStatus.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.contract.update).not.toHaveBeenCalled();
	});
});
