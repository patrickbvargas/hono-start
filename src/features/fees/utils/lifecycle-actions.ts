import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "@/shared/session";

interface FeeLifecycleActionOptions {
	canManageLifecycle: boolean;
	contractStatusValue: string;
	isSoftDeleted: boolean;
}

interface FeeLifecycleActions {
	canDelete: boolean;
	canEdit: boolean;
	canRestore: boolean;
}

export function getFeeLifecycleActions({
	canManageLifecycle,
	contractStatusValue,
	isSoftDeleted,
}: FeeLifecycleActionOptions): FeeLifecycleActions {
	const canEdit =
		!isSoftDeleted &&
		!(
			[
				CONTRACT_STATUS_CANCELLED_VALUE,
				CONTRACT_STATUS_COMPLETED_VALUE,
			] as string[]
		).includes(contractStatusValue);

	return {
		canEdit,
		canRestore: canManageLifecycle && isSoftDeleted,
		canDelete: canManageLifecycle && !isSoftDeleted,
	};
}
