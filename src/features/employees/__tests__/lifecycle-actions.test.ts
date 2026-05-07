import { describe, expect, it } from "vitest";
import { getEmployeeLifecycleActions } from "../utils/lifecycle-actions";

describe("getEmployeeLifecycleActions", () => {
	it("allows edit and delete only when lifecycle management is enabled and entity is active", () => {
		expect(
			getEmployeeLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: true,
			canRestore: false,
			canDelete: true,
		});
	});

	it("allows only restore when entity is soft-deleted", () => {
		expect(
			getEmployeeLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: true,
			}),
		).toEqual({
			canEdit: false,
			canRestore: true,
			canDelete: false,
		});
	});

	it("hides lifecycle actions without management permission", () => {
		expect(
			getEmployeeLifecycleActions({
				canManageLifecycle: false,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: false,
			canRestore: false,
			canDelete: false,
		});
	});
});
