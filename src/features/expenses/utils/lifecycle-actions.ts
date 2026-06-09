interface ExpenseLifecycleActionOptions {
	canManageLifecycle: boolean;
	isSoftDeleted: boolean;
}

interface ExpenseLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getExpenseLifecycleActions({
	canManageLifecycle,
	isSoftDeleted,
}: ExpenseLifecycleActionOptions): ExpenseLifecycleActions {
	return {
		canEdit: !isSoftDeleted,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
