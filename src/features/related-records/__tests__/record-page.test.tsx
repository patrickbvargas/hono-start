// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useRecordPage } from "../hooks/use-record-page";

const mocks = vi.hoisted(() => ({
	navigate: vi.fn(),
	search: { page: 3, query: "Ana", tab: "history", unrelated: "discard" },
}));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mocks.navigate,
	useSearch: () => mocks.search,
}));
vi.mock("@/features/clients", async () => ({
	clientSearchSchema: (await import("@/features/clients/schemas/search"))
		.clientSearchSchema,
}));
vi.mock("@/features/employees", async () => ({
	employeeSearchSchema: (await import("@/features/employees/schemas/search"))
		.employeeSearchSchema,
}));
vi.mock("@/features/contracts", async () => ({
	contractSearchSchema: (await import("@/features/contracts/schemas/search"))
		.contractSearchSchema,
}));
vi.mock("@/features/fees", async () => ({
	feeSearchSchema: (await import("@/features/fees/schemas/search"))
		.feeSearchSchema,
}));
vi.mock("@/features/expenses", async () => ({
	expenseSearchSchema: (await import("@/features/expenses/schemas/search"))
		.expenseSearchSchema,
}));
vi.mock("@/features/remunerations", async () => ({
	remunerationSearchSchema: (
		await import("@/features/remunerations/schemas/search")
	).remunerationSearchSchema,
}));

it.each([
	["client", "/clientes/$clientId", "clientId"],
	["employee", "/colaboradores/$employeeId", "employeeId"],
	["contract", "/contratos/$contractId", "contractId"],
	["fee", "/honorarios/$feeId", "feeId"],
	["expense", "/despesas/$expenseId", "expenseId"],
	["remuneration", "/remuneracoes/$remunerationId", "remunerationId"],
] as const)(
	"navigates %s directly with validated return context",
	async (kind, to, param) => {
		mocks.navigate.mockClear();
		const { result } = renderHook(() => useRecordPage(kind, 42));
		expect(mocks.navigate).not.toHaveBeenCalled();
		await act(() => result.current.openPage());
		expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith({
			to,
			params: { [param]: "42" },
			search: {
				tab: "overview",
				returnTo: expect.objectContaining({ page: 3, query: "Ana" }),
			},
		});
		const options = mocks.navigate.mock.calls[0]?.[0];
		expect(options.search.returnTo).not.toHaveProperty("unrelated");
		expect(options.search.returnTo).not.toHaveProperty("tab");
	},
);
