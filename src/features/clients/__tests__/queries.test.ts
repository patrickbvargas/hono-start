import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		client: {
			findMany: vi.fn(),
			count: vi.fn(),
			findFirst: vi.fn(),
		},
		clientType: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { getClientById, getClients, getClientTypes } from "../data/queries";

const timestamp = new Date("2026-01-01T12:00:00.000Z");

const clientRow = {
	id: 1,
	fullName: "Maria Cliente",
	document: "52998224725",
	type: {
		id: 10,
		value: "INDIVIDUAL",
		label: "Pessoa Física",
		isActive: true,
	},
	_count: {
		contracts: 2,
	},
	isActive: true,
	deletedAt: null,
	email: "maria@example.com",
	phone: "11999999999",
	createdAt: timestamp,
	updatedAt: timestamp,
};

describe("client data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.client.findMany.mockResolvedValue([clientRow]);
		prismaMock.client.count.mockResolvedValue(1);
		prismaMock.client.findFirst.mockResolvedValue(clientRow);
		prismaMock.clientType.findMany.mockResolvedValue([
			{
				id: 10,
				value: "INDIVIDUAL",
				label: "Pessoa Física",
				isActive: true,
			},
		]);
	});

	it("builds tenant-scoped paginated list queries with aligned count and stable sorting", async () => {
		const result = await getClients({
			firmId: 99,
			search: {
				page: 2,
				limit: 10,
				column: "type",
				direction: "desc",
				query: "Maria",
				type: ["INDIVIDUAL"],
				active: "true",
				status: "active",
			},
		});

		const expectedWhere = {
			firmId: 99,
			deletedAt: null,
			isActive: true,
			OR: [
				{
					fullName: {
						contains: "Maria",
						mode: "insensitive",
					},
				},
				{
					document: {
						contains: "Maria",
					},
				},
			],
			type: {
				value: {
					in: ["INDIVIDUAL"],
				},
			},
		};

		expect(prismaMock.client.findMany).toHaveBeenCalledWith({
			where: expectedWhere,
			include: {
				type: true,
				_count: {
					select: {
						contracts: true,
					},
				},
			},
			orderBy: [{ type: { label: "desc" } }, { id: "asc" }],
			skip: 10,
			take: 10,
		});
		expect(prismaMock.client.count).toHaveBeenCalledWith({
			where: expectedWhere,
		});
		expect(result).toEqual({
			data: [
				{
					id: 1,
					fullName: "Maria Cliente",
					document: "52998224725",
					type: "Pessoa Física",
					contractCount: 2,
					isActive: true,
					isSoftDeleted: false,
				},
			],
			total: 1,
			page: 2,
			pageSize: 10,
		});
	});

	it("maps detail rows into UI-ready models with lookup labels and values", async () => {
		await expect(getClientById({ firmId: 99, id: 1 })).resolves.toEqual({
			id: 1,
			fullName: "Maria Cliente",
			document: "52998224725",
			email: "maria@example.com",
			phone: "11999999999",
			typeId: 10,
			type: "Pessoa Física",
			typeValue: "INDIVIDUAL",
			contractCount: 2,
			isActive: true,
			isSoftDeleted: false,
			createdAt: timestamp.toISOString(),
			updatedAt: timestamp.toISOString(),
		});

		expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
			where: { id: 1, firmId: 99 },
			include: {
				type: true,
				_count: {
					select: {
						contracts: true,
					},
				},
			},
		});
	});

	it("loads lookup options sorted by label without hiding inactive rows", async () => {
		await getClientTypes();

		expect(prismaMock.clientType.findMany).toHaveBeenCalledWith({
			orderBy: { label: "asc" },
		});
	});
});
