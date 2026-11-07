import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session";
import { getSettlementOptions } from "../data/queries";
import { settlementOptionsSchema } from "../schemas/model";

const mocks = vi.hoisted(() => ({ title: vi.fn(), methods: vi.fn() }));
vi.mock("@/shared/lib/prisma", () => ({
	prisma: {
		receivable: { findFirst: mocks.title },
		payable: { findFirst: mocks.title },
		paymentMethod: { findMany: mocks.methods },
	},
}));
const session: LoggedUserSession = {
	permissions: [
		"org:receipts:create",
		"org:receipts:read_all",
		"org:payments:create",
	],
	firm: { id: 1, name: "Matriz" },
	person: { id: 100 },
	employee: { id: 10 },
	employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	user: { fullName: "Operador", email: "operator@example.com" },
	clerk: { userId: "user_a", organizationId: "org_a", sessionId: "sess_a" },
};
beforeEach(() => {
	vi.resetAllMocks();
	mocks.title.mockResolvedValue({ id: 5, contractRevenueReceivable: null });
	mocks.methods.mockResolvedValue([{ value: "PIX", label: "Pix" }]);
});
describe("settlement option payload", () => {
	it.each(["receivable", "payable"] as const)(
		"loads %s options and preserves selectable values across both validation boundaries",
		async (direction) => {
			const result = await getSettlementOptions(session, {
				direction,
				titleId: 5,
			});
			const received = settlementOptionsSchema.parse(
				JSON.parse(JSON.stringify(result)),
			);
			expect(received).toEqual({ methods: [{ value: "PIX", label: "Pix" }] });
			expect(mocks.methods).toHaveBeenCalledWith({
				where: { isActive: true },
				orderBy: [{ label: "asc" }, { id: "asc" }],
				select: { value: true, label: true },
			});
		},
	);
	it("does not load options without title authority", async () => {
		await expect(
			getSettlementOptions(
				{ ...session, permissions: [] },
				{ direction: "payable", titleId: 5 },
			),
		).rejects.toThrow("Você não tem permissão");
		expect(mocks.methods).not.toHaveBeenCalled();
	});
	it("rejects malformed method payloads", () => {
		expect(
			settlementOptionsSchema.safeParse({ methods: [{ value: "PIX" }] })
				.success,
		).toBe(false);
	});
});
