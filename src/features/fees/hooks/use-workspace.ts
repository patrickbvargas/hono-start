import { useOverlay } from "@/shared/hooks/use-overlay";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getFeeLifecycleActions } from "../utils/lifecycle-actions";
import { useFee } from "./use-data";
export function useFeeWorkspace(id: number) {
	const { fee } = useFee(id);
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const actions = getFeeLifecycleActions({
		canManageLifecycle:
			hasPermission(session, "org:fees:delete") ||
			hasPermission(session, "org:fees:restore"),
		isSoftDeleted: fee.isSoftDeleted,
		contractStatusValue: fee.contractStatusValue,
	});
	return {
		canReadAttachments: hasPermission(session, "org:attachments:read"),
		fee,
		overlay,
		canEdit: actions.canEdit && hasPermission(session, "org:fees:update"),
		canDelete: actions.canDelete && hasPermission(session, "org:fees:delete"),
		canRestore:
			actions.canRestore && hasPermission(session, "org:fees:restore"),
	};
}
