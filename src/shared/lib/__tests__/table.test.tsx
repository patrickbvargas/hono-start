// @vitest-environment jsdom

import { createColumnHelper, useTable } from "@tanstack/react-table";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { dataTableFeatures } from "../table";

type Entry = { id: number; amount: number };
const helper = createColumnHelper<typeof dataTableFeatures, Entry>();
const columns = [
	helper.accessor((row): unknown => row.amount, {
		id: "amount",
		enableSorting: true,
	}),
	helper.display({ id: "actions", enableSorting: false }),
];

describe("shared table v9 contract", () => {
	it("preserves accessor values and server sorting capabilities", () => {
		const { result } = renderHook(() =>
			useTable({
				features: dataTableFeatures,
				columns,
				data: [{ id: 1, amount: 42 }],
			}),
		);
		const table = result.current;
		expect(table.getRowModel().rows[0].getValue("amount")).toBe(42);
		expect(table.getColumn("amount")?.getCanSort()).toBe(true);
		expect(table.getColumn("actions")?.getCanSort()).toBe(false);
		expect(table.getRowModel().rows[0].getVisibleCells()).toHaveLength(2);
	});
	it("replaces rows when refreshed server data arrives", () => {
		const { result, rerender } = renderHook(
			({ data }: { data: Entry[] }) =>
				useTable({ features: dataTableFeatures, columns, data }),
			{ initialProps: { data: [{ id: 1, amount: 42 }] } },
		);
		rerender({ data: [{ id: 2, amount: 99 }] });
		expect(result.current.getRowModel().rows[0].original.id).toBe(2);
		expect(result.current.getRowModel().rows[0].getValue("amount")).toBe(99);
	});
});

it("uses native pagination and preserves original row indices", () => {
	const data = Array.from({ length: 25 }, (_, id) => ({ id, amount: id }));
	const { result } = renderHook(() =>
		useTable({
			features: dataTableFeatures,
			columns,
			data,
			initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
		}),
	);
	expect(result.current.getRowModel().rows).toHaveLength(10);
	expect(result.current.getPageCount()).toBe(3);
	act(() => result.current.setPageIndex(2));
	expect(result.current.getRowModel().rows).toHaveLength(5);
	expect(result.current.getRowModel().rows[0].index).toBe(20);
});
it("renders every supplied server row with manual pagination", () => {
	const data = Array.from({ length: 25 }, (_, id) => ({ id, amount: id }));
	const { result } = renderHook(() =>
		useTable({
			features: dataTableFeatures,
			columns,
			data,
			manualPagination: true,
		}),
	);
	expect(result.current.getRowModel().rows).toHaveLength(25);
});
