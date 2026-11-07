import { describe, expect, it, vi } from "vitest";
import { seedContractGeneration } from "../../../../prisma/seed-contract-generation";
import type { SeedTransaction } from "../../../../prisma/seed-financial-fixtures";

function database(existing: boolean) {
	return {
		auditLog: { findFirst: vi.fn().mockResolvedValue({ id: 1 }) },
		contractStatus: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 1 }) },
		legalArea: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 2 }) },
		revenueType: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 3 }) },
		assignmentType: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 4 }) },
		clientProfile: { findFirstOrThrow: vi.fn().mockResolvedValue({ id: 10 }) },
		employeeProfile: { findMany: vi.fn().mockResolvedValue([{ id: 20 }]) },
		firm: { findMany: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) },
		contract: {
			findUnique: vi.fn().mockResolvedValue(existing ? { id: 6 } : null),
			create: vi.fn().mockResolvedValue({ id: 6 }),
			findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 6 }),
		},
		contractAssignment: { createMany: vi.fn() },
		revenue: { create: vi.fn() },
	};
}

describe("contract generation seed", () => {
	it("refuses databases without demo seed marker before writing", async () => {
		const tx = database(false);
		tx.auditLog.findFirst.mockResolvedValue(null);
		await expect(
			seedContractGeneration(tx as unknown as SeedTransaction),
		).rejects.toThrow("banco demonstrativo");
		expect(tx.contract.create).not.toHaveBeenCalled();
	});
	it("creates active contracts with client, team and unbridged revenue in each demo Firm", async () => {
		const tx = database(false);
		await seedContractGeneration(tx as unknown as SeedTransaction);
		expect(tx.contract.create).toHaveBeenCalledTimes(2);
		expect(tx.contract.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				firmId: 1,
				processNumber: "DEMO-1-GERAR-PARCELAS",
				customerId: 10,
			}),
		});
		expect(tx.revenue.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				negotiatedAmount: "1000.00",
				firmId: 1,
				contractId: 6,
			}),
		});
		expect(tx.contractAssignment.createMany).toHaveBeenCalledWith({
			data: [
				{
					firmId: 1,
					contractId: 6,
					employeeProfileId: 20,
					assignmentTypeId: 4,
				},
			],
		});
	});
	it("preserves existing contracts and generated financial history on reruns", async () => {
		const tx = database(true);
		await seedContractGeneration(tx as unknown as SeedTransaction);
		expect(tx.contract.create).not.toHaveBeenCalled();
		expect(tx.revenue.create).not.toHaveBeenCalled();
		expect(tx.contractAssignment.createMany).not.toHaveBeenCalled();
	});
});
