// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Option } from "@/shared/schemas/option";
import { useFeeFormOptions } from "../hooks/use-data";

const { loadRevenues } = vi.hoisted(() => ({ loadRevenues: vi.fn() }));

vi.mock("../api/queries", () => ({
	getSelectableFeeContractsQueryOptions: () => ({
		queryKey: ["contracts"],
		queryFn: async () => [],
	}),
	getSelectableFeeRevenuesQueryOptions: (id: string) => ({
		queryKey: ["revenues", id],
		queryFn: () => loadRevenues(id),
	}),
}));

describe("fee form options", () => {
	it("keeps the form rendered while loading options for a new contract", async () => {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		client.setQueryData(["contracts"], []);
		let resolveOptions!: (options: Option[]) => void;
		loadRevenues.mockImplementation(
			() =>
				new Promise<Option[]>((resolve) => {
					resolveOptions = resolve;
				}),
		);
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>
				<Suspense fallback={<div>Form skeleton</div>}>{children}</Suspense>
			</QueryClientProvider>
		);
		const { result, rerender } = renderHook(
			({ contractId }) => useFeeFormOptions({ contractId }),
			{ initialProps: { contractId: "" }, wrapper },
		);
		expect(loadRevenues).not.toHaveBeenCalled();
		rerender({ contractId: "1" });
		expect(result.current.isLoadingRevenues).toBe(true);
		expect(document.body.textContent).not.toContain("Form skeleton");
		const options = [
			{ id: 1, value: "1", label: "Judicial", isDisabled: false },
		];
		await act(async () => resolveOptions(options));
		await waitFor(() => expect(result.current.revenues).toEqual(options));
		rerender({ contractId: "2" });
		expect(result.current.isLoadingRevenues).toBe(true);
		expect(result.current.revenues).toEqual([]);
		expect(document.body.textContent).not.toContain("Form skeleton");
		await act(async () => resolveOptions([]));
		client.clear();
	});
});
