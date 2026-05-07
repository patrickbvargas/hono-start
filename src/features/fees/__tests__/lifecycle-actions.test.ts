import { describe, expect, it } from "vitest";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "@/shared/session";
import { getFeeLifecycleActions } from "../utils/lifecycle-actions";

describe("getFeeLifecycleActions", () => {
	it("allows edit for fee tied to writable contract", () => {
		expect(
			getFeeLifecycleActions({
				canManageLifecycle: false,
				contractStatusValue: "ACTIVE",
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: true,
			canRestore: false,
			canDelete: false,
		});
	});

	it("blocks edit when parent contract is completed or cancelled", () => {
		expect(
			getFeeLifecycleActions({
				canManageLifecycle: true,
				contractStatusValue: CONTRACT_STATUS_COMPLETED_VALUE,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: false,
			canRestore: false,
			canDelete: true,
		});

		expect(
			getFeeLifecycleActions({
				canManageLifecycle: true,
				contractStatusValue: CONTRACT_STATUS_CANCELLED_VALUE,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: false,
			canRestore: false,
			canDelete: true,
		});
	});

	it("allows only restore for soft-deleted fees", () => {
		expect(
			getFeeLifecycleActions({
				canManageLifecycle: true,
				contractStatusValue: "ACTIVE",
				isSoftDeleted: true,
			}),
		).toEqual({
			canEdit: false,
			canRestore: true,
			canDelete: false,
		});
	});
});
