import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Inspect export declarations without evaluating provider/server dependencies.
function readExports(path: string): Record<string, true> {
	const source = readFileSync(path, "utf8");
	const exports: Record<string, true> = {};
	for (const match of source.matchAll(
		/export\s+(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/g,
	)) {
		exports[match[1]] = true;
	}
	for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
		for (const entry of match[1].split(",")) {
			const value = entry.trim();
			if (value && !value.startsWith("type ")) {
				exports[value.split(/\s+as\s+/).at(-1) ?? value] = true;
			}
		}
	}
	for (const match of source.matchAll(
		/export\s*\*\s*from\s*["']([^"']+)["']/g,
	)) {
		const base = resolve(dirname(path), match[1]);
		const target = [
			`${base}.ts`,
			`${base}.tsx`,
			`${base}/index.ts`,
			`${base}/index.tsx`,
		].find(existsSync);
		if (!target) {
			throw new Error(`Unresolved barrel export: ${base}`);
		}
		Object.assign(exports, readExports(target));
	}
	return exports;
}
const attachments = readExports("src/features/attachments/index.ts");
const auditLogs = readExports("src/features/audit-logs/index.ts");
const authentication = readExports("src/features/authentication/index.ts");
const contracts = readExports("src/features/contracts/index.ts");
const dashboard = readExports("src/features/dashboard/index.ts");
const people = readExports("src/features/people/index.ts");

describe("feature public barrels", () => {
	it("keeps the authentication barrel limited to top-level auth surfaces and route hooks", () => {
		expect(authentication).toHaveProperty("AuthenticationScreen");
		expect(authentication).toHaveProperty("useUserProfile");
		expect(authentication).toHaveProperty("LoginForm");
		expect(authentication).not.toHaveProperty("PasswordResetRequestForm");
		expect(authentication).not.toHaveProperty("PasswordResetCompleteForm");
		expect(authentication).toHaveProperty("useLogout");
		expect(authentication).not.toHaveProperty("useLoginForm");
		expect(authentication).not.toHaveProperty("loginMutationOptions");
	});

	it("keeps people barrel route-focused", () => {
		expect(people).toHaveProperty("getPeopleQueryOptions");
		expect(people).toHaveProperty("PersonForm");
		expect(people).not.toHaveProperty("usePersonForm");
	});

	it("keeps the contract barrel limited to its public surface", () => {
		expect(contracts).toHaveProperty("getContractsQueryOptions");
		expect(contracts).toHaveProperty("ContractForm");
		expect(contracts).not.toHaveProperty("createContractMutationOptions");
		expect(contracts).not.toHaveProperty("useContractOptions");
	});

	it("keeps supporting and reporting barrels free of incidental exports", () => {
		expect(attachments).toHaveProperty("AttachmentSection");
		expect(attachments).not.toHaveProperty("getAttachmentsByOwnerQueryOptions");
		expect(attachments).not.toHaveProperty("AttachmentForm");
		expect(attachments).not.toHaveProperty("attachmentUploadInputSchema");

		expect(auditLogs).toHaveProperty("getAuditLogsQueryOptions");
		expect(auditLogs).toHaveProperty("getAuditLogActionsQueryOptions");
		expect(auditLogs).toHaveProperty("getAuditLogActorsQueryOptions");
		expect(auditLogs).toHaveProperty("AuditLogFilter");

		expect(dashboard).toHaveProperty("getDashboardSummaryQueryOptions");
		expect(dashboard).toHaveProperty("getDashboardEmployeeOptionsQueryOptions");
		expect(dashboard).toHaveProperty("DashboardFilter");
	});
});
