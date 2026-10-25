import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => vi.fn());
vi.mock("../hooks/use-data", () => ({ usePendingWorkPreviewData: query }));

import { useRelatedContractAlerts } from "../hooks/use-related-contract-alerts";

beforeEach(() => {
	query.mockReset();
	query.mockReturnValue({
		pendingWork: undefined,
		isPending: true,
		error: null,
		retry: vi.fn(),
	});
});
describe("related contract alert search scope", () => {
	it.each(["client", "employee"] as const)(
		"uses exact %s ID, five preview rows and an independent collection page",
		(kind) => {
			const result = useRelatedContractAlerts({ kind, id: 42 });
			expect(query).toHaveBeenCalledWith(
				expect.objectContaining({
					clientId: kind === "client" ? "42" : "",
					employeeId: kind === "employee" ? "42" : "",
					page: 1,
					limit: 5,
					column: "severity",
					query: "",
				}),
			);
			expect(result.collectionSearch).toMatchObject({
				clientId: kind === "client" ? "42" : "",
				employeeId: kind === "employee" ? "42" : "",
				page: 1,
				limit: 25,
			});
		},
	);
});
