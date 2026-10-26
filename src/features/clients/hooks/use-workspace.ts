import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getClientLifecycleActions } from "../utils/lifecycle-actions";
import { useClient } from "./use-data";
export function useClientWorkspace(id: number) {
	const { client } = useClient(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const actions = getClientLifecycleActions({
		canManageLifecycle:
			hasPermission(session, "org:clients:delete") ||
			hasPermission(session, "org:clients:restore"),
		isSoftDeleted: client.isSoftDeleted,
	});
	return {
		client,
		canReadFinance:
			hasPermission(session, "org:contracts:read_all") &&
			hasPermission(session, "org:fees:read_all"),
		overlay,
		canEdit: actions.canEdit && hasPermission(session, "org:clients:update"),
		canDelete:
			actions.canDelete && hasPermission(session, "org:clients:delete"),
		canRestore:
			actions.canRestore && hasPermission(session, "org:clients:restore"),
	};
}
