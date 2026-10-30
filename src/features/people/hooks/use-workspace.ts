import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getPersonLifecycleActions } from "../utils/lifecycle-actions";
import { usePerson } from "./use-data";
export function usePersonWorkspace(id: number) {
	const { person } = usePerson(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const actions = getPersonLifecycleActions({
		canManageLifecycle:
			hasPermission(session, "org:people:delete") ||
			hasPermission(session, "org:people:restore"),
		isSoftDeleted: person.isSoftDeleted,
	});
	return {
		person,
		canReadFinance:
			(hasPermission(session, "org:receivables:read_all") &&
				hasPermission(session, "org:receipts:read_all")) ||
			(hasPermission(session, "org:payables:read_all") &&
				hasPermission(session, "org:payments:read_all")),
		overlay,
		canEdit: actions.canEdit && hasPermission(session, "org:people:update"),
		canDelete: actions.canDelete && hasPermission(session, "org:people:delete"),
		canRestore:
			actions.canRestore && hasPermission(session, "org:people:restore"),
	};
}
