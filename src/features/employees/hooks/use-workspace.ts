import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getEmployeeLifecycleActions } from "../utils/lifecycle-actions";
import { useEmployee } from "./use-data";
export function useEmployeeWorkspace(id: number) {
	const { employee } = useEmployee(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const actions = getEmployeeLifecycleActions({
		canManageLifecycle:
			hasPermission(session, "org:employees:delete") ||
			hasPermission(session, "org:employees:restore"),
		isSoftDeleted: employee.isSoftDeleted,
	});
	return {
		employee,
		overlay,
		canEdit: actions.canEdit && hasPermission(session, "org:employees:update"),
		canDelete:
			actions.canDelete && hasPermission(session, "org:employees:delete"),
		canRestore:
			actions.canRestore && hasPermission(session, "org:employees:restore"),
	};
}
