import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		remuneration: {
			count: vi.fn(),
			findFirst: vi.fn(),
			findMany: vi.fn(),
		},
		contract: {
			findMany: vi.fn(),
		},
		employee: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { REMUNERATION_ERRORS } from "../constants/errors";
import {
	buildRemunerationWhere,
	getRemunerationById,
	getRemunerations,
	getRemunerationsForExport,
	getSelectableRemunerationContracts,
	getSelectableRemunerationEmployees,
} from "../data/queries";

const baseSearch = {
	page: 1,
	limit: 10,
	column: "paymentDate" as const,
	direction: "desc" as const,
	employeeId: "99",
	contractId: "55",
	dateFrom: "2026-01-01",
	dateTo: "2026-01-31",
	active: "all" as const,
	status: "active" as const,
};

function createRemunerationRow() {
	return {
		id: 1,
		contractEmployeeId: 12,
		effectivePercentage: "0.2",
		amount: "300",
		paymentDate: new Date("2026-01-20T00:00:00.000Z"),
		isSystemGenerated: true,
		isActive: true,
		deletedAt: null,
		createdAt: new Date("2026-01-20T00:00:00.000Z"),
		updatedAt: new Date("2026-01-21T00:00:00.000Z"),
		contractEmployee: {
			id: 12,
			contractId: 55,
			employeeId: 10,
			employee: { fullName: "Maria Silva" },
			contract: {
				processNumber: "PROC-001",
				client: { fullName: "Cliente A" },
			},
		},
		fee: {
			id: 99,
			amount: "1500",
			installmentNumber: 2,
			deletedAt: null,
		},
	};
}

describe("remuneration data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.remuneration.findMany.mockResolvedValue([
			createRemunerationRow(),
		]);
		prismaMock.remuneration.count.mockResolvedValue(1);
		prismaMock.remuneration.findFirst.mockResolvedValue(
			createRemunerationRow(),
		);
		prismaMock.contract.findMany.mockResolvedValue([
			{
				id: 55,
				processNumber: "PROC-001",
				client: { fullName: "Cliente A" },
			},
		]);
		prismaMock.employee.findMany.mockResolvedValue([
			{
				id: 10,
				fullName: "Maria Silva",
			},
		]);
	});

	it("keeps regular users scoped to their own employee identity in remuneration filters", () => {
		expect(
			buildRemunerationWhere({
				firmId: 1,
				employeeId: 10,
				isAdmin: false,
				filter: baseSearch,
			}),
		).toEqual({
			firmId: 1,
			deletedAt: null,
			paymentDate: {
				gte: new Date("2026-01-01T00:00:00.000Z"),
				lte: new Date("2026-01-31T23:59:59.999Z"),
			},
			contractEmployee: {
				contractId: 55,
				employeeId: 10,
			},
		});
	});

	it("allows administrators to filter by selected employee and preserves deterministic ordering", async () => {
		const result = await getRemunerations({
			scope: { firmId: 1, isAdmin: true, employeeId: 10 },
			search: baseSearch,
		});

		expect(prismaMock.remuneration.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 1,
					contractEmployee: {
						contractId: 55,
						employeeId: 99,
					},
				}),
				orderBy: [{ paymentDate: "desc" }, { id: "asc" }],
			}),
		);
		expect(result.data).toEqual([
			expect.objectContaining({
				employeeId: 10,
				employeeName: "Maria Silva",
				contractId: 55,
				isManualOverride: false,
			}),
		]);
	});

	it("uses same mapped scope for export and role-scoped selectable options", async () => {
		await expect(
			getRemunerationsForExport({
				scope: { firmId: 1, isAdmin: false, employeeId: 10 },
				search: baseSearch,
			}),
		).resolves.toEqual([
			expect.objectContaining({
				contractId: 55,
				employeeId: 10,
			}),
		]);

		await expect(
			getSelectableRemunerationContracts({
				firmId: 1,
				isAdmin: false,
				employeeId: 10,
			}),
		).resolves.toEqual([
			{
				id: 55,
				value: "55",
				label: "PROC-001 • Cliente A",
				isDisabled: false,
			},
		]);
		expect(prismaMock.contract.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					firmId: 1,
					assignments: {
						some: {
							employeeId: 10,
							remunerations: {
								some: {
									firmId: 1,
								},
							},
						},
					},
				},
			}),
		);

		await expect(
			getSelectableRemunerationEmployees({
				firmId: 1,
				isAdmin: false,
				employeeId: 10,
			}),
		).resolves.toEqual([]);
	});

	it("returns detail errors safely when scoped remuneration does not exist", async () => {
		prismaMock.remuneration.findFirst.mockResolvedValue(null);

		await expect(
			getRemunerationById({
				id: 1,
				scope: { firmId: 1, isAdmin: false, employeeId: 10 },
			}),
		).rejects.toThrow(REMUNERATION_ERRORS.REMUNERATION_DETAIL_NOT_FOUND);
	});
});
