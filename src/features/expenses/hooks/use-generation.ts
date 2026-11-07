import { useQueryClient } from "@tanstack/react-query";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { can, hasPermission, useLoggedUserSession } from "@/shared/session";
import { expenseKeys } from "../api/queries";
import type { ExpenseDetail } from "../schemas/model";

export function useExpenseGeneration(expense: ExpenseDetail) {
	const session = useLoggedUserSession();
	const client = useQueryClient();
	const { overlay } = useOverlay<number>();
	const resource = { firmId: session.firm.id };
	const canGenerate =
		expense.isActive &&
		!expense.isSoftDeleted &&
		!expense.hasGeneratedTitles &&
		can(session, "org:payables:generate", resource) &&
		can(session, ["org:expenses:create", "org:expenses:update"], resource);
	const canReadTitles = hasPermission(session, "org:payables:read_all");
	async function refreshExpense() {
		await client.invalidateQueries({ queryKey: expenseKeys.all });
	}
	return { overlay, canGenerate, canReadTitles, refreshExpense };
}
