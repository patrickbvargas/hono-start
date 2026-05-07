interface EmployeeLifecycleActionOptions {
	canManageLifecycle: boolean;
	isSoftDeleted: boolean;
}

interface EmployeeLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getEmployeeLifecycleActions({
	canManageLifecycle,
	isSoftDeleted,
}: EmployeeLifecycleActionOptions): EmployeeLifecycleActions {
	return {
		canEdit: canManageLifecycle && !isSoftDeleted,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
