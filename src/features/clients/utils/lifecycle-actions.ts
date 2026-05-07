interface ClientLifecycleActionOptions {
	canManageLifecycle: boolean;
	isSoftDeleted: boolean;
}

interface ClientLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getClientLifecycleActions({
	canManageLifecycle,
	isSoftDeleted,
}: ClientLifecycleActionOptions): ClientLifecycleActions {
	return {
		canEdit: !isSoftDeleted,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
