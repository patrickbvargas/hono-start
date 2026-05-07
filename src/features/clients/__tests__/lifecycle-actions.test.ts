import { describe, expect, it } from "vitest";
import { getClientLifecycleActions } from "../utils/lifecycle-actions";

describe("getClientLifecycleActions", () => {
	it("allows edit and delete for active clients when lifecycle management is enabled", () => {
		expect(
			getClientLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: true,
			canRestore: false,
			canDelete: true,
		});
	});

	it("allows only restore for soft-deleted clients when lifecycle management is enabled", () => {
		expect(
			getClientLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: true,
			}),
		).toEqual({
			canEdit: false,
			canRestore: true,
			canDelete: false,
		});
	});

	it("hides delete and restore for non-admin users", () => {
		expect(
			getClientLifecycleActions({
				canManageLifecycle: false,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: true,
			canRestore: false,
			canDelete: false,
		});
	});
});
