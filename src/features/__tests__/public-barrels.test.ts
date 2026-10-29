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
const clients = readExports("src/features/clients/index.ts");
const contracts = readExports("src/features/contracts/index.ts");
const dashboard = readExports("src/features/dashboard/index.ts");
const employees = readExports("src/features/employees/index.ts");
const fees = readExports("src/features/fees/index.ts");
const remunerations = readExports("src/features/remunerations/index.ts");

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

	it("keeps client and employee barrels route-focused", () => {
		expect(clients).toHaveProperty("getClientsQueryOptions");
		expect(clients).toHaveProperty("ClientForm");
		expect(clients).not.toHaveProperty("useClientForm");

		expect(employees).toHaveProperty("getEmployeesQueryOptions");
		expect(employees).toHaveProperty("EmployeeForm");
		expect(employees).not.toHaveProperty("useEmployeeForm");
	});

	it("keeps contract and fee barrels aligned with the same minimal surface", () => {
		expect(contracts).toHaveProperty("getContractsQueryOptions");
		expect(contracts).toHaveProperty("ContractForm");
		expect(contracts).not.toHaveProperty("createContractMutationOptions");
		expect(contracts).not.toHaveProperty("useContractOptions");

		expect(fees).toHaveProperty("getFeesQueryOptions");
		expect(fees).toHaveProperty("FeeForm");
		expect(fees).not.toHaveProperty("createFeeMutationOptions");
		expect(fees).not.toHaveProperty("useFeeForm");
	});

	it("keeps remuneration barrel minimal while preserving the route-level export hook", () => {
		expect(remunerations).toHaveProperty("getRemunerationsQueryOptions");
		expect(remunerations).toHaveProperty("RemunerationForm");
		expect(remunerations).toHaveProperty("useRemunerationExport");
		expect(remunerations).not.toHaveProperty(
			"updateRemunerationMutationOptions",
		);
		expect(remunerations).not.toHaveProperty("useRemunerationForm");
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
