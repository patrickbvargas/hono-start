import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		contract: {
			count: vi.fn(),
			findFirst: vi.fn(),
			findMany: vi.fn(),
		},
		client: {
			findMany: vi.fn(),
		},
		employee: {
			findMany: vi.fn(),
		},
		legalArea: {
			findMany: vi.fn(),
		},
		contractStatus: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getContractById,
	getContracts,
	getSelectableContractClients,
	getSelectableContractEmployees,
} from "../data/queries";

describe("contract data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.legalArea.findMany.mockResolvedValue([{ id: 7 }]);
		prismaMock.contractStatus.findMany.mockResolvedValue([{ id: 8 }]);
		prismaMock.contract.count.mockResolvedValue(1);
		prismaMock.contract.findMany.mockResolvedValue([
			{
				id: 5,
				processNumber: "PROC-001",
				clientId: 9,
				legalAreaId: 7,
				statusId: 8,
				feePercentage: "0.3",
				isActive: true,
				deletedAt: null,
				createdAt: new Date("2026-01-05T00:00:00.000Z"),
				updatedAt: new Date("2026-01-10T00:00:00.000Z"),
				client: { fullName: "Cliente A" },
				legalArea: { label: "Previdenciário", value: "SOCIAL_SECURITY" },
				status: { label: "Ativo", value: "ACTIVE" },
				assignments: [{ employeeId: 10 }],
				revenues: [{ id: 20 }],
			},
		]);
		prismaMock.contract.findFirst.mockResolvedValue({
			id: 5,
			processNumber: "PROC-001",
			clientId: 9,
			legalAreaId: 7,
			statusId: 8,
			feePercentage: "0.3",
			notes: "obs",
			allowStatusChange: true,
			isActive: true,
			deletedAt: null,
			createdAt: new Date("2026-01-05T00:00:00.000Z"),
			updatedAt: new Date("2026-01-10T00:00:00.000Z"),
			client: { fullName: "Cliente A" },
			legalArea: { label: "Previdenciário", value: "SOCIAL_SECURITY" },
			status: { label: "Ativo", value: "ACTIVE" },
			assignments: [
				{
					id: 1,
					employeeId: 10,
					isActive: true,
					deletedAt: null,
					employee: {
						fullName: "Maria Silva",
						type: { label: "Advogado", value: "LAWYER" },
					},
					assignmentType: { label: "Responsável", value: "RESPONSIBLE" },
				},
				{
					id: 2,
					employeeId: 11,
					isActive: false,
					deletedAt: new Date("2026-01-11T00:00:00.000Z"),
					employee: {
						fullName: "João Souza",
						type: { label: "Advogado", value: "LAWYER" },
					},
					assignmentType: { label: "Indicante", value: "RECOMMENDING" },
				},
			],
			revenues: [
				{
					id: 20,
					typeId: 3,
					totalValue: "1000",
					downPaymentValue: "100",
					paymentStartDate: new Date("2026-01-01T00:00:00.000Z"),
					totalInstallments: 3,
					isActive: true,
					deletedAt: null,
					type: { label: "Mensal", value: "MONTHLY" },
					fees: [{ amount: "150" }, { amount: "200" }],
				},
			],
		});
		prismaMock.client.findMany.mockResolvedValue([
			{ id: 1, fullName: "Cliente A" },
		]);
		prismaMock.employee.findMany.mockResolvedValue([
			{
				id: 10,
				fullName: "Maria Silva",
				type: { label: "Advogado" },
			},
		]);
	});

	it("scopes regular-user lists by firm, assignment, filters, and deterministic sorting", async () => {
		const search = {
			page: 2,
			limit: 10,
			column: "createdAt" as const,
			direction: "desc" as const,
			clientId: "9",
			legalArea: ["SOCIAL_SECURITY"],
			contractStatus: ["ACTIVE"],
			active: "all" as const,
			status: "active" as const,
		};

		const result = await getContracts({
			scope: { firmId: 1, employeeId: 10, isAdmin: false },
			search,
		});

		expect(prismaMock.contract.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 1,
					clientId: 9,
					legalAreaId: { in: [7] },
					statusId: { in: [8] },
					deletedAt: null,
					assignments: {
						some: {
							employeeId: 10,
							deletedAt: null,
							isActive: true,
						},
					},
				}),
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
				skip: 10,
				take: 10,
			}),
		);
		expect(prismaMock.contract.count).toHaveBeenCalledWith({
			where: expect.objectContaining({
				firmId: 1,
				clientId: 9,
			}),
		});
		expect(result).toEqual({
			data: [
				expect.objectContaining({
					id: 5,
					assignedEmployeeIds: [10],
					isAssignedToActor: true,
				}),
			],
			total: 1,
			page: 2,
			pageSize: 10,
		});
	});

	it("maps detail queries into UI-ready aggregates with derived revenue payment state", async () => {
		const result = await getContractById({
			scope: { firmId: 1, employeeId: 10, isAdmin: false },
			id: 5,
		});

		expect(prismaMock.contract.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 1,
					id: 5,
					assignments: {
						some: {
							employeeId: 10,
							deletedAt: null,
							isActive: true,
						},
					},
				}),
			}),
		);
		expect(result.assignedEmployeeIds).toEqual([10]);
		expect(result.revenues).toEqual([
			expect.objectContaining({
				id: 20,
				paidValue: 450,
				installmentsPaid: 2,
				remainingValue: 550,
				isFullyPaid: false,
			}),
		]);
	});

	it("loads selectable clients and employees from active non-deleted business entities only", async () => {
		await expect(getSelectableContractClients(1)).resolves.toEqual([
			{
				id: 1,
				value: "1",
				label: "Cliente A",
				isDisabled: false,
			},
		]);
		expect(prismaMock.client.findMany).toHaveBeenCalledWith({
			where: { firmId: 1, deletedAt: null, isActive: true },
			orderBy: { fullName: "asc" },
			select: {
				id: true,
				fullName: true,
			},
		});

		await expect(getSelectableContractEmployees(1)).resolves.toEqual([
			{
				id: 10,
				value: "10",
				label: "Maria Silva • Advogado",
				isDisabled: false,
			},
		]);
		expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
			where: { firmId: 1, deletedAt: null, isActive: true },
			orderBy: { fullName: "asc" },
			select: {
				id: true,
				fullName: true,
				type: { select: { label: true } },
			},
		});
	});
});
