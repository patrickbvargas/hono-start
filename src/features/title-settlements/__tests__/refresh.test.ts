import { QueryClient } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";

vi.mock("@/features/audit-logs", () => ({
	refreshAuditedEntityQueries: vi.fn(async () => {}),
}));
vi.mock("@/features/contracts", () => ({
	contractKeys: { all: ["contract"] },
}));
vi.mock("@/features/dashboard", () => ({
	dashboardKeys: { all: ["dashboard"] },
}));
vi.mock("@/features/expenses", () => ({ expenseKeys: { all: ["expense"] } }));
vi.mock("@/features/financial-titles", () => ({
	financialTitleKeys: { all: ["financial-title"] },
}));
vi.mock("@/features/payables", () => ({ payableKeys: { all: ["payable"] } }));
vi.mock("@/features/pending-work", () => ({
	pendingWorkKeys: { all: ["pending-work"] },
}));
vi.mock("@/features/receivables", () => ({
	receivableKeys: { all: ["receivable"] },
}));

import { refreshSettlementQueries } from "../utils/refresh";

it("refreshes cached movement and balance queries even when their tab is inactive", async () => {
	const client = new QueryClient({
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	});
	let reversed = false;
	const movements = {
		queryKey: ["receivable", "receipts", 2],
		queryFn: async () => ({ reversed }),
	};
	const balance = {
		queryKey: ["receivable", "detail", 2],
		queryFn: async () => ({ balance: reversed ? 500 : 499.99 }),
	};
	try {
		await client.query(movements);
		await client.query(balance);
		reversed = true;
		await refreshSettlementQueries(client);
		expect(client.getQueryData(movements.queryKey)).toEqual({ reversed: true });
		expect(client.getQueryData(balance.queryKey)).toEqual({ balance: 500 });
	} finally {
		client.clear();
	}
});
