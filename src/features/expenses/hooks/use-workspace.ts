import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getExpenseLifecycleActions } from "../utils/lifecycle-actions";
import { useExpense } from "./use-data";
export function useExpenseWorkspace(id: number) {
	const { expense } = useExpense(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const actions = getExpenseLifecycleActions({
		canManageLifecycle:
			hasPermission(session, "org:expenses:delete") ||
			hasPermission(session, "org:expenses:restore"),
		isSoftDeleted: expense.isSoftDeleted,
	});
	return {
		expense,
		overlay,
		canEdit: actions.canEdit && hasPermission(session, "org:expenses:update"),
		canDelete:
			actions.canDelete && hasPermission(session, "org:expenses:delete"),
		canRestore:
			actions.canRestore && hasPermission(session, "org:expenses:restore"),
	};
}
