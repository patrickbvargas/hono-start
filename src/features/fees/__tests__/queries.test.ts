import { beforeEach, describe, expect, it, vi } from "vitest";
import { feeSearchSchema } from "../schemas/search";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fee: {
			aggregate: vi.fn(),
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
				client: { id: 41, fullName: "Cliente A" },
			},
		},
	};
}

describe("fee data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.fee.aggregate.mockResolvedValue({ _sum: { amount: "9876.54" } });
		prismaMock.fee.count.mockResolvedValue(1);
		prismaMock.fee.findMany.mockResolvedValue([createFeeRow()]);
		prismaMock.fee.findFirst.mockResolvedValue(createFeeRow());
	});

	it("filters fee lists by contract query and allowed contract scope", async () => {
		const result = await getFees({
			scope: {
				firmId: 1,
				employeeId: 10,
				employeeTypeValue: "LAWYER",
				isAdmin: false,
			},
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
									assignmentType: {
										value: {
											in: ["RESPONSIBLE", "RECOMMENDED"],
										},
									},
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
		expect(result.totalAmount).toBe(9876.54);
		expect(prismaMock.fee.aggregate).toHaveBeenCalledWith({
			where: prismaMock.fee.findMany.mock.calls[0]?.[0].where,
			_sum: { amount: true },
		});
		expect(result.data).toEqual([
			expect.objectContaining({
				id: 7,
				contractProcessNumber: "PROC-001",
				clientId: 41,
			}),
		]);
	});

	it("combines exact client filtering with restricted assignments for rows and totals", async () => {
		await getFees({
			scope: {
				firmId: 1,
				employeeId: 10,
				employeeTypeValue: "LAWYER",
				isAdmin: false,
			},
			search: feeSearchSchema.parse({ clientId: 41, contractId: "5" }),
		});
		const where = prismaMock.fee.findMany.mock.calls[0][0].where;
		expect(where.AND).toEqual([{ revenue: { contract: { clientId: 41 } } }]);
		expect(where.revenue.contract.assignments.some.employeeId).toBe(10);
		expect(where.revenue.contractId).toBe(5);
		expect(prismaMock.fee.aggregate.mock.calls[0][0].where).toEqual(where);
		expect(prismaMock.fee.count.mock.calls[0][0].where).toEqual(where);
	});
	it("keeps detail lookups compatible with the query-enabled filter defaults", async () => {
		await expect(
			getFeeById({
				scope: {
					firmId: 1,
					employeeId: 10,
					employeeTypeValue: "LAWYER",
					isAdmin: false,
				},
				id: 7,
			}),
		).resolves.toEqual(
			expect.objectContaining({
				id: 7,
				contractProcessNumber: "PROC-001",
				clientId: 41,
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
									assignmentType: {
										value: {
											in: ["RESPONSIBLE", "RECOMMENDED"],
										},
									},
								},
							},
						},
					},
				}),
			}),
		);
	});
});
