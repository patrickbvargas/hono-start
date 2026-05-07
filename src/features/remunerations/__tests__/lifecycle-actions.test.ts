import { describe, expect, it } from "vitest";
import { getRemunerationLifecycleActions } from "../utils/lifecycle-actions";

describe("getRemunerationLifecycleActions", () => {
	it("allows edit and delete only with lifecycle management for active entity", () => {
		expect(
			getRemunerationLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: false,
			}),
		).toEqual({
			canEdit: true,
			canRestore: false,
			canDelete: true,
		});
	});

	it("allows only restore when remuneration is soft-deleted", () => {
		expect(
			getRemunerationLifecycleActions({
				canManageLifecycle: true,
				isSoftDeleted: true,
			}),
		).toEqual({
			canEdit: false,
			canRestore: true,
			canDelete: false,
		});
	});

	it("hides lifecycle actions without permission", () => {
		expect(
			getRemunerationLifecycleActions({
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
