import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../constants/values";

interface ContractLifecycleActionOptions {
	canManageLifecycle: boolean;
	isSoftDeleted: boolean;
	statusValue: string;
}

interface ContractLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getContractLifecycleActions({
	canManageLifecycle,
	isSoftDeleted,
	statusValue,
}: ContractLifecycleActionOptions): ContractLifecycleActions {
	const canEdit =
		!isSoftDeleted &&
		!(
			[
				CONTRACT_STATUS_CANCELLED_VALUE,
				CONTRACT_STATUS_COMPLETED_VALUE,
			] as string[]
		).includes(statusValue);

	return {
		canEdit,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
