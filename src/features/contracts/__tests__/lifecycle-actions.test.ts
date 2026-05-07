import { describe, expect, it } from "vitest";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../constants/values";
import { getContractLifecycleActions } from "../utils/lifecycle-actions";

describe("getContractLifecycleActions", () => {
	it("allows edit for active non-deleted contracts", () => {
		expect(
			getContractLifecycleActions({
				canManageLifecycle: false,
				isSoftDeleted: false,
				statusValue: "ACTIVE",
			}),
		).toEqual({
			canEdit: true,
			canRestore: false,
			canDelete: false,
		});
	});

	it("blocks edit for completed or cancelled contracts", () => {
		expect(
			getContractLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: false,
				statusValue: CONTRACT_STATUS_COMPLETED_VALUE,
			}),
		).toEqual({
			canEdit: false,
			canRestore: false,
			canDelete: true,
		});

		expect(
			getContractLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: false,
				statusValue: CONTRACT_STATUS_CANCELLED_VALUE,
			}),
		).toEqual({
			canEdit: false,
			canRestore: false,
			canDelete: true,
		});
	});

	it("allows only restore for soft-deleted contracts", () => {
		expect(
			getContractLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: true,
				statusValue: "ACTIVE",
			}),
		).toEqual({
			canEdit: false,
			canRestore: true,
			canDelete: false,
		});
	});
});
