import { beforeEach, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
	employee: { findFirst: vi.fn() },
	remuneration: { aggregate: vi.fn() },
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

import { getEmployeeFinance } from "../data/queries";

beforeEach(() => {
	vi.clearAllMocks();
	db.employee.findFirst.mockResolvedValue({ id: 14 });
});
it("scopes active persisted remuneration totals to firm and employee", async () => {
	db.remuneration.aggregate.mockResolvedValue({ _sum: { amount: "1234.56" } });
	expect(await getEmployeeFinance({ firmId: 7, id: 14 })).toEqual({
		totalAmount: 1234.56,
	});
	expect(db.employee.findFirst).toHaveBeenCalledWith({
		where: { id: 14 },
		select: { id: true },
	});
	expect(db.remuneration.aggregate).toHaveBeenCalledWith({
		where: {
			firmId: 7,
			isActive: true,
			deletedAt: null,
			contractEmployee: { firmId: 7, employeeId: 14 },
		},
		_sum: { amount: true },
	});
});
it("returns zero with no remunerations", async () => {
	db.remuneration.aggregate.mockResolvedValue({ _sum: { amount: null } });
	expect(await getEmployeeFinance({ firmId: 7, id: 14 })).toEqual({
		totalAmount: 0,
	});
});
it("rejects nonexistent employees before reading totals", async () => {
	db.employee.findFirst.mockResolvedValue(null);
	await expect(getEmployeeFinance({ firmId: 7, id: 14 })).rejects.toThrow();
	expect(db.remuneration.aggregate).not.toHaveBeenCalled();
});
