import { describe, expect, it } from "vitest";
import {
	clerkPermissionCatalog,
	clerkPermissionSchema,
	clerkPermissions,
} from "./catalog";

describe("Clerk business permission catalog", () => {
	it("uses unique feature/action keys without provider system features", () => {
		expect(new Set(clerkPermissions).size).toBe(clerkPermissions.length);
		for (const key of clerkPermissions) {
			expect(key).toMatch(/^org:(?!sys_)[a-z_]+:[a-z_]+$/);
			expect(clerkPermissionSchema.safeParse(key).success).toBe(true);
		}
	});
	it("keeps scoped reads, exports and independent employee operations", () => {
		expect(clerkPermissionCatalog.employees).toEqual([
			"read",
			"create",
			"update",
			"delete",
			"restore",
		]);
		expect(
			clerkPermissionSchema.safeParse("org:client_read:clients_read").success,
		).toBe(false);
		expect(
			clerkPermissionSchema.safeParse("org:employees:manage").success,
		).toBe(false);
		expect(clerkPermissions).toContain("org:remunerations:export_own");
		expect(clerkPermissions).toContain("org:contracts:update_assigned");
	});
});
