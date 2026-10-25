import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getRemunerationLifecycleActions } from "../utils/lifecycle-actions";
import { useRemuneration } from "./use-data";
export function useRemunerationWorkspace(id: number) {
	const { remuneration } = useRemuneration(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const actions = getRemunerationLifecycleActions({
		canManageLifecycle:
			hasPermission(session, "org:remunerations:delete") ||
			hasPermission(session, "org:remunerations:restore"),
		isSoftDeleted: remuneration.isSoftDeleted,
	});
	return {
		remuneration,
		overlay,
		canEdit:
			actions.canEdit && hasPermission(session, "org:remunerations:update"),
		canDelete:
			actions.canDelete && hasPermission(session, "org:remunerations:delete"),
		canRestore:
			actions.canRestore && hasPermission(session, "org:remunerations:restore"),
	};
}
