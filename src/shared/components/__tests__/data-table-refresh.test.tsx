// @vitest-environment jsdom

import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { dataTableFeatures } from "@/shared/lib/table";
import { DataTable } from "../data-table";

vi.mock("@/shared/hooks/use-sort", () => ({
	useSort: () => ({ column: "", direction: "asc", handleSort: vi.fn() }),
}));
afterEach(cleanup);
it("refreshes movement status when an existing row changes after reversal", () => {
	const c = createColumnHelper<
		typeof dataTableFeatures,
		{ id: number; status: string }
	>();
	const columns = [
		c.accessor("status", { header: "Situação", enableSorting: false }),
	];
	const { rerender } = render(
		<DataTable columns={columns} data={[{ id: 1, status: "Confirmado" }]} />,
	);
	expect(screen.getByText("Confirmado")).toBeTruthy();
	rerender(
		<DataTable columns={columns} data={[{ id: 1, status: "Estornado" }]} />,
	);
	expect(screen.getByText("Estornado")).toBeTruthy();
	expect(screen.queryByText("Confirmado")).toBeNull();
});
