import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { refreshAuditedEntityQueries } from "../utils/refresh";

vi.mock("../api/queries", () => ({ auditLogKeys: { all: ["audit-log"] } }));

describe("audited mutation refresh", () => {
	it("invalidates indefinitely cached selections used by other forms without touching session data", async () => {
		const client = new QueryClient();
		const contracts = ["contract", "client-options"];
		const fees = ["fee", "contract-options"];
		for (const queryKey of [contracts, fees]) {
			await client.query({
				queryKey,
				staleTime: Infinity,
				meta: { refreshOnMutation: true },
				queryFn: async () => [],
			});
		}
		client.setQueryData(["client"], []);
		client.setQueryData(["audit-log"], []);
		client.setQueryData(["session"], { user: "current" });
		await refreshAuditedEntityQueries(client, ["client"]);
		for (const queryKey of [contracts, fees, ["client"], ["audit-log"]]) {
			expect(client.getQueryState(queryKey)?.isInvalidated).toBe(true);
		}
		expect(client.getQueryState(["session"])?.isInvalidated).toBe(false);
		client.clear();
	});
});
