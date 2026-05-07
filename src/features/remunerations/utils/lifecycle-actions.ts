interface RemunerationLifecycleActionOptions {
	canManageLifecycle: boolean;
	isSoftDeleted: boolean;
}

interface RemunerationLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getRemunerationLifecycleActions({
	canManageLifecycle,
	isSoftDeleted,
}: RemunerationLifecycleActionOptions): RemunerationLifecycleActions {
	return {
		canEdit: canManageLifecycle && !isSoftDeleted,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
