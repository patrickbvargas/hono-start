import { describe, expect, it } from "vitest";
import { getExpenseLifecycleActions } from "../utils/lifecycle-actions";

describe("getExpenseLifecycleActions", () => {
	it("allows edit and delete for active expenses", () => {
		expect(
			getExpenseLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: true,
			canDelete: true,
			canRestore: false,
		});
	});

	it("allows only restore for soft-deleted expenses", () => {
		expect(
			getExpenseLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: true,
			}),
		).toEqual({
			canEdit: false,
			canDelete: false,
			canRestore: true,
		});
	});
});
