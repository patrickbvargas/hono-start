import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ZodType } from "zod";
import type { LoggedUserSession } from "@/shared/session";

const mocks = vi.hoisted(() => ({
	options: vi.fn(),
	session: null as LoggedUserSession | null,
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let schema: ZodType;
		return {
			middleware() {
				return this;
			},
			validator(value: ZodType) {
				schema = value;
				return this;
			},
			handler:
				(handler: (args: unknown) => unknown) => (args: { data: unknown }) =>
					handler({
						data: schema.parse(args.data),
						context: { session: mocks.session },
					}),
		};
	},
}));
vi.mock("@/shared/session/server", () => ({ authMiddleware: {} }));
vi.mock("../data/queries", () => ({
	getTitleGenerationOptions: mocks.options,
}));

import {
	financialTitleKeys,
	getTitleGenerationOptionsQueryOptions,
} from "../api/queries";

beforeEach(() => {
	mocks.options
		.mockReset()
		.mockResolvedValue({ analytics: [], paymentMethods: [] });
	mocks.session = {
		permissions: ["org:payables:generate"],
		clerk: { userId: "u", organizationId: "o", sessionId: "s" },
		user: { fullName: "Admin", email: "admin@example.com" },
		employee: { id: 10 },
		person: { id: 100 },
		firm: { id: 7, name: "Matriz" },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	};
});

async function request(direction: "receivable" | "payable") {
	const fn = getTitleGenerationOptionsQueryOptions(direction)
		.queryFn as unknown as () => Promise<unknown>;
	return fn();
}

describe("direction-specific generation options", () => {
	it("loads expense options with only payable generation permission", async () => {
		await expect(request("payable")).resolves.toEqual({
			analytics: [],
			paymentMethods: [],
		});
		await expect(request("receivable")).rejects.toThrow("permissão");
	});
	it("does not grant payable options to receivable-only operators", async () => {
		if (!mocks.session) {
			throw new Error("Missing test session");
		}
		mocks.session.permissions = ["org:receivables:generate"];
		await expect(request("payable")).rejects.toThrow("permissão");
		await expect(request("receivable")).resolves.toBeDefined();
	});
	it("keeps direction caches separate", () => {
		expect(financialTitleKeys.options("payable")).not.toEqual(
			financialTitleKeys.options("receivable"),
		);
	});
});
