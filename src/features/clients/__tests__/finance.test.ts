import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
	client: { findFirst: vi.fn() },
	revenue: { findMany: vi.fn() },
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

import { feeSearchSchema } from "@/features/fees/schemas/search";
import { Prisma } from "@/generated/prisma/client";
import { getClientFinance } from "../data/queries";
import { clientWorkspaceSearchSchema } from "../schemas/workspace";

beforeEach(() => {
	vi.clearAllMocks();
	db.client.findFirst.mockResolvedValue({
		id: 1,
		fullName: "Cliente",
		document: "123",
		email: null,
		phone: null,
		type: { id: 1, label: "Tipo", value: "TYPE" },
		_count: { contracts: 2 },
		isActive: true,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
});
describe("client finance", () => {
	it("sums exact decimals, includes deposits and clamps each revenue balance", async () => {
		db.revenue.findMany.mockResolvedValue([
			{
				contractId: 1,
				totalValue: new Prisma.Decimal("100"),
				downPaymentValue: new Prisma.Decimal("10.10"),
				fees: [{ amount: new Prisma.Decimal("20.20") }],
			},
			{
				contractId: 1,
				totalValue: new Prisma.Decimal("50"),
				downPaymentValue: null,
				fees: [{ amount: new Prisma.Decimal("60") }],
			},
		]);
		expect(await getClientFinance({ firmId: 7, id: 1 })).toEqual({
			contractCount: 1,
			totalValue: 150,
			paidValue: 90.3,
			remainingValue: 69.7,
		});
		expect(db.revenue.findMany.mock.calls[0][0].where).toEqual({
			firmId: 7,
			isActive: true,
			deletedAt: null,
			contract: { firmId: 7, clientId: 1, isActive: true, deletedAt: null },
		});
		expect(db.revenue.findMany.mock.calls[0][0].select.fees.where).toEqual({
			firmId: 7,
			isActive: true,
			deletedAt: null,
		});
	});
	it("returns zero for an empty client", async () => {
		db.revenue.findMany.mockResolvedValue([]);
		expect(await getClientFinance({ firmId: 7, id: 1 })).toEqual({
			contractCount: 0,
			totalValue: 0,
			paidValue: 0,
			remainingValue: 0,
		});
	});
	it("rejects a client outside the tenant before querying financial data", async () => {
		db.client.findFirst.mockResolvedValue(null);
		await expect(getClientFinance({ firmId: 7, id: 1 })).rejects.toThrow();
		expect(db.revenue.findMany).not.toHaveBeenCalled();
	});
	it("validates the finance tab and exact receipt client filter", () => {
		expect(clientWorkspaceSearchSchema.parse({ tab: "finance" }).tab).toBe(
			"finance",
		);
		expect(feeSearchSchema.parse({ clientId: "14" }).clientId).toBe(14);
		expect(feeSearchSchema.parse({ clientId: -1 }).clientId).toBeUndefined();
	});
});
