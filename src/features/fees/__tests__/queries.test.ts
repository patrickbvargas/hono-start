import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fee: {
			count: vi.fn(),
			findFirst: vi.fn(),
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { getFeeById, getFees } from "../data/queries";

function createFeeRow() {
	return {
		id: 7,
		paymentDate: new Date("2026-01-20T00:00:00.000Z"),
		amount: "1500",
		installmentNumber: 2,
		generatesRemuneration: true,
		isActive: true,
		deletedAt: null,
		createdAt: new Date("2026-01-20T00:00:00.000Z"),
		updatedAt: new Date("2026-01-21T00:00:00.000Z"),
		remunerations: [{ id: 1, deletedAt: null }],
		revenue: {
			id: 12,
			type: { label: "Judicial", value: "JUDICIAL" },
			contract: {
				id: 5,
				processNumber: "PROC-001",
				status: { value: "ACTIVE" },
				client: { fullName: "Cliente A" },
			},
		},
	};
}

describe("fee data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.fee.count.mockResolvedValue(1);
		prismaMock.fee.findMany.mockResolvedValue([createFeeRow()]);
		prismaMock.fee.findFirst.mockResolvedValue(createFeeRow());
	});

	it("filters fee lists by contract query and allowed contract scope", async () => {
		const result = await getFees({
			scope: { firmId: 1, employeeId: 10, isAdmin: false },
			search: {
				page: 2,
				limit: 10,
				column: "paymentDate",
				direction: "desc",
				query: "PROC",
				contractId: "5",
				revenueId: "",
				dateFrom: "",
				dateTo: "",
				active: "all",
				status: "active",
			},
		});

		expect(prismaMock.fee.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					firmId: 1,
					deletedAt: null,
					OR: [
						{
							revenue: {
								contract: {
									processNumber: {
										contains: "PROC",
										mode: "insensitive",
									},
								},
							},
						},
					],
					revenue: {
						contractId: 5,
						contract: {
							assignments: {
								some: {
									employeeId: 10,
									deletedAt: null,
									isActive: true,
								},
							},
						},
					},
				},
				orderBy: [{ paymentDate: "desc" }, { id: "asc" }],
				skip: 10,
				take: 10,
			}),
		);
		expect(result.data).toEqual([
			expect.objectContaining({
				id: 7,
				contractProcessNumber: "PROC-001",
			}),
		]);
	});

	it("keeps detail lookups compatible with the query-enabled filter defaults", async () => {
		await expect(
			getFeeById({
				scope: { firmId: 1, employeeId: 10, isAdmin: false },
				id: 7,
			}),
		).resolves.toEqual(
			expect.objectContaining({
				id: 7,
				contractProcessNumber: "PROC-001",
			}),
		);
		expect(prismaMock.fee.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 1,
					id: 7,
					revenue: {
						contract: {
							assignments: {
								some: {
									employeeId: 10,
									deletedAt: null,
									isActive: true,
								},
							},
						},
					},
				}),
			}),
		);
	});
});
