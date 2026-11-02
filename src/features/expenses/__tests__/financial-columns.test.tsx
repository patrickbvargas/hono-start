import { expect, it, vi } from "vitest";
import { getExpenseTableColumns } from "../components/table/columns";

vi.mock("@/shared/components/entity-id-trigger", () => ({
	EntityIdTrigger: () => null,
}));

it("keeps financial amounts immediately before row actions", () => {
	const columns = getExpenseTableColumns(() => null);
	const ids = columns.map((column) =>
		"accessorKey" in column ? column.accessorKey : column.id,
	);
	expect(ids.slice(-2)).toEqual(["negotiatedAmount", "actions"]);
});
