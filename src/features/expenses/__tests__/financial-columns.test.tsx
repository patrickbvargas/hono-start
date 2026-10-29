import { expect, it, vi } from "vitest";
import { getFeeTableColumns } from "../../fees/components/table/columns";
import { getRemunerationTableColumns } from "../../remunerations/components/table/columns";
import { getExpenseTableColumns } from "../components/table/columns";

vi.mock("@/shared/components/entity-id-trigger", () => ({
	EntityIdTrigger: () => null,
}));

it("keeps financial amounts immediately before row actions", () => {
	for (const columns of [
		getExpenseTableColumns(() => null),
		getFeeTableColumns(() => null),
		getRemunerationTableColumns(() => null),
	]) {
		const ids = columns.map((column) =>
			"accessorKey" in column ? column.accessorKey : column.id,
		);
		expect(ids.slice(-2)).toEqual(["amount", "actions"]);
	}
});
