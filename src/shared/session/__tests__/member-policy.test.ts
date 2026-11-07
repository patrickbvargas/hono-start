import { describe, expect, it } from "vitest";
import { assertMemberGrantBoundaries } from "../member-policy";
import type { ClerkPermission } from "../schema";

describe("Member financial grant boundaries", () => {
	it("allows explicit receivable generation without manual authority", () => {
		expect(() =>
			assertMemberGrantBoundaries("org:member", [
				"org:receivables:generate",
				"org:contracts:update_assigned",
			]),
		).not.toThrow();
	});
	it.each<ClerkPermission>([
		"org:receivables:create",
		"org:payables:create",
		"org:payables:generate",
		"org:payables:read_all",
		"org:payments:create",
		"org:receipts:reverse",
	])("rejects forbidden Member grant %s even alongside generation", (key) => {
		expect(() =>
			assertMemberGrantBoundaries("org:member", [
				"org:receivables:generate",
				key,
			]),
		).toThrow("Configuração de permissões incompatível");
	});
	it("does not add grants based on role", () => {
		const permissions: ClerkPermission[] = [];
		assertMemberGrantBoundaries("org:member", permissions);
		expect(permissions).toEqual([]);
	});
});
