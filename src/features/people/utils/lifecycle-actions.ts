interface PersonLifecycleActionOptions {
	canManageLifecycle: boolean;
	isSoftDeleted: boolean;
}

interface PersonLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getPersonLifecycleActions({
	canManageLifecycle,
	isSoftDeleted,
}: PersonLifecycleActionOptions): PersonLifecycleActions {
	return {
		canEdit: !isSoftDeleted,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
