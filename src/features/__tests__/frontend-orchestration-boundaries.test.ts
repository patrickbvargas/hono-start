import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { sep } from "node:path";
import { describe, expect, it } from "vitest";

function normalizePath(path: string) {
	return path.split(sep).join("/");
}

function listFiles(directory: string): string[] {
	const entries = readdirSync(directory);
	const files: string[] = [];

	for (const entry of entries) {
		const path = `${directory}/${entry}`;
		const stats = statSync(path);

		if (stats.isDirectory()) {
			files.push(...listFiles(path));
			continue;
		}

		files.push(path);
	}

	return files;
}

function getLine(content: string, index: number | undefined) {
	return content.slice(0, index).split("\n").length;
}

function formatViolation(
	path: string,
	content: string,
	index: number,
	detail: string,
) {
	return `${normalizePath(path)}:${getLine(content, index)}:${detail}`;
}

describe("frontend orchestration boundaries", () => {
	it("keeps feature query consumption hooks consolidated in use-data files", () => {
		const optionHooks = [
			{
				hookFile: "src/features/attachments/hooks/use-data.ts",
				hookName: "useAttachmentOptions",
			},
			{
				hookFile: "src/features/audit-logs/hooks/use-data.ts",
				hookName: "useAuditLogOptions",
			},
			{
				hookFile: "src/features/clients/hooks/use-data.ts",
				hookName: "useClientOptions",
			},
			{
				hookFile: "src/features/contracts/hooks/use-data.ts",
				hookName: "useContractOptions",
			},
			{
				hookFile: "src/features/dashboard/hooks/use-data.ts",
				hookName: "useDashboardOptions",
			},
			{
				hookFile: "src/features/employees/hooks/use-data.ts",
				hookName: "useEmployeeOptions",
			},
			{
				hookFile: "src/features/fees/hooks/use-data.ts",
				hookName: "useFeeOptions",
			},
			{
				hookFile: "src/features/remunerations/hooks/use-data.ts",
				hookName: "useRemunerationOptions",
			},
		];
		const staleUseOptionsFiles = listFiles("src/features")
			.map(normalizePath)
			.filter((path) => path.endsWith("/hooks/use-options.ts"))
			.map((path) => `${path}:1:option hooks must live in hooks/use-data.ts`);
		const missingOptionHooks = optionHooks.flatMap(({ hookFile, hookName }) => {
			if (!existsSync(hookFile)) {
				return [`${hookFile}:1:missing feature data hook file`];
			}

			const content = readFileSync(hookFile, "utf8");

			if (content.includes(`function ${hookName}`)) {
				return [];
			}

			return [`${hookFile}:1:missing ${hookName}`];
		});

		expect([...staleUseOptionsFiles, ...missingOptionHooks]).toEqual([]);
	});

	it("keeps multi-option hooks on the shared suspense queries pattern", () => {
		const multiOptionHooks = [
			{
				hookFile: "src/features/audit-logs/hooks/use-data.ts",
				hookName: "useAuditLogOptions",
			},
			{
				hookFile: "src/features/contracts/hooks/use-data.ts",
				hookName: "useContractOptions",
			},
			{
				hookFile: "src/features/employees/hooks/use-data.ts",
				hookName: "useEmployeeOptions",
			},
			{
				hookFile: "src/features/fees/hooks/use-data.ts",
				hookName: "useFeeOptions",
			},
		];
		const violations = multiOptionHooks.flatMap(({ hookFile, hookName }) => {
			const content = readFileSync(hookFile, "utf8");
			const hookStart = content.indexOf(`function ${hookName}`);
			const hookContent = content.slice(hookStart);
			const separateSuspenseCalls = [
				...hookContent.matchAll(/useSuspenseQuery\(/g),
			];
			const checks = [
				{
					passes: hookContent.includes("useSuspenseQueries({"),
					message: `${hookFile}:1:${hookName} must use useSuspenseQueries`,
				},
				{
					passes: separateSuspenseCalls.length === 0,
					message: `${hookFile}:1:${hookName} must not use separate useSuspenseQuery calls`,
				},
			];

			return checks.flatMap((check) => (check.passes ? [] : [check.message]));
		});

		expect(violations).toEqual([]);
	});

	it("keeps cache invalidation rooted in feature key factories", () => {
		const refreshCallFiles = listFiles("src/features")
			.map(normalizePath)
			.filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
			.filter((path) => !path.includes("/__tests__/"))
			.filter((path) => {
				const content = readFileSync(path, "utf8");
				return content.includes("refreshEntityQueries(");
			});
		const violations = refreshCallFiles.flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const refreshCalls = [
				...content.matchAll(/refreshEntityQueries\([^)]*\)/gs),
			];

			return refreshCalls.flatMap((match) => {
				if (match[0].includes("Keys.all") || match[0].includes("keys.all")) {
					return [];
				}

				return [
					`${path}:${getLine(content, match.index)}:refreshEntityQueries must receive featureKeys.all`,
				];
			});
		});
		const exportedRawCacheKeys = listFiles("src/features")
			.map(normalizePath)
			.filter((path) => path.endsWith("/api/queries.ts"))
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");
				const matches = [...content.matchAll(/const \w+_DATA_CACHE_KEY/g)];

				return matches.map(
					(match) =>
						`${path}:${getLine(content, match.index)}:query key factories must own root keys directly`,
				);
			});

		expect([...violations, ...exportedRawCacheKeys]).toEqual([]);
	});

	it("keeps query key factories in the feature api boundary", () => {
		const staleKeyFiles = listFiles("src/features")
			.map(normalizePath)
			.filter(
				(path) =>
					path.endsWith("/constants/cache.ts") ||
					path.endsWith("/api/query-keys.ts"),
			)
			.map(
				(path) => `${path}:1:query key factories must live in api/queries.ts`,
			);

		expect(staleKeyFiles).toEqual([]);
	});

	it("keeps route page data behind feature data hooks", () => {
		const routeDataHooks = [
			{
				route: "src/routes/index.tsx",
				hookFile: "src/features/dashboard/hooks/use-data.ts",
				hookName: "useDashboardData",
				queryFactoryName: "getDashboardSummaryQueryOptions",
				dataField: "summary",
			},
			{
				route: "src/routes/clientes.tsx",
				hookFile: "src/features/clients/hooks/use-data.ts",
				hookName: "useClientData",
				queryFactoryName: "getClientsQueryOptions",
				dataField: "clients",
			},
			{
				route: "src/routes/colaboradores.tsx",
				hookFile: "src/features/employees/hooks/use-data.ts",
				hookName: "useEmployeeData",
				queryFactoryName: "getEmployeesQueryOptions",
				dataField: "employees",
			},
			{
				route: "src/routes/contratos.tsx",
				hookFile: "src/features/contracts/hooks/use-data.ts",
				hookName: "useContractData",
				queryFactoryName: "getContractsQueryOptions",
				dataField: "contracts",
			},
			{
				route: "src/routes/honorarios.tsx",
				hookFile: "src/features/fees/hooks/use-data.ts",
				hookName: "useFeeData",
				queryFactoryName: "getFeesQueryOptions",
				dataField: "fees",
			},
			{
				route: "src/routes/remuneracoes.tsx",
				hookFile: "src/features/remunerations/hooks/use-data.ts",
				hookName: "useRemunerationData",
				queryFactoryName: "getRemunerationsQueryOptions",
				dataField: "remunerations",
			},
			{
				route: "src/routes/audit-log.tsx",
				hookFile: "src/features/audit-logs/hooks/use-data.ts",
				hookName: "useAuditLogData",
				queryFactoryName: "getAuditLogsQueryOptions",
				dataField: "auditLogs",
			},
		];
		const violations = routeDataHooks.flatMap(
			({ route, hookFile, hookName, queryFactoryName, dataField }) => {
				const routeContent = readFileSync(route, "utf8");
				const hookContent = existsSync(hookFile)
					? readFileSync(hookFile, "utf8")
					: "";
				const checks = [
					{
						passes: existsSync(hookFile),
						message: `${hookFile}:1:missing feature data hook file`,
					},
					{
						passes: !routeContent.includes("useSuspenseQuery"),
						message: `${route}:1:route must not consume primary data with useSuspenseQuery directly`,
					},
					{
						passes: routeContent.includes(hookName),
						message: `${route}:1:route must consume ${hookName}`,
					},
					{
						passes: !routeContent.includes("/hooks/use-data"),
						message: `${route}:1:route must import data hooks through feature barrel`,
					},
					{
						passes:
							hookContent.includes("useSuspenseQuery") &&
							hookContent.includes(queryFactoryName),
						message: `${hookFile}:1:data hook must wrap ${queryFactoryName}`,
					},
					{
						passes: hookContent.includes(`return { ${dataField} };`),
						message: `${hookFile}:1:data hook must return named ${dataField} data`,
					},
				];

				return checks.flatMap((check) => (check.passes ? [] : [check.message]));
			},
		);

		expect(violations).toEqual([]);
	});

	it("keeps form hooks responsible for parsed submit, cache refresh, and toast feedback", () => {
		const formHooks = listFiles("src/features")
			.map(normalizePath)
			.filter((path) => path.endsWith("/hooks/use-form.ts"));
		const violations = formHooks.flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const checks = [
				{
					passes: content.includes(".parse(value)"),
					message: "form hook does not parse submitted values",
				},
				{
					passes: content.includes("mutateAsync"),
					message: "form hook does not submit through mutation boundary",
				},
				{
					passes: content.includes("refreshEntityQueries"),
					message: "form hook does not refresh feature cache",
				},
				{
					passes:
						content.includes("toast.success") &&
						content.includes("toast.danger"),
					message: "form hook does not own success and error toasts",
				},
			];

			return checks.flatMap((check) =>
				check.passes ? [] : [`${path}:1:${check.message}`],
			);
		});

		expect(violations).toEqual([]);
	});

	it("keeps filter hooks URL-driven through shared filter orchestration", () => {
		const filterHooks = listFiles("src/features")
			.map(normalizePath)
			.filter((path) => path.endsWith("/hooks/use-filter.ts"));
		const violations = filterHooks.flatMap((path) => {
			const content = readFileSync(path, "utf8");

			if (
				content.includes("useFilter(") &&
				content.includes("handleFilter") &&
				content.includes(".parse(value)")
			) {
				return [];
			}

			return [
				`${path}:1:filter hook must parse form values and call shared handleFilter`,
			];
		});

		expect(violations).toEqual([]);
	});

	it("keeps entity tables wired to lifecycle authority and shared empty state", () => {
		const tableFiles = listFiles("src/features")
			.map(normalizePath)
			.filter((path) => path.endsWith("/components/table/index.tsx"))
			.filter((path) => !path.includes("/audit-logs/"));
		const violations = tableFiles.flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const checks = [
				{
					passes: content.includes("canManageLifecycle"),
					message: "entity table does not expose canManageLifecycle",
				},
				{
					passes: content.includes("EntityActions"),
					message: "entity table does not use shared EntityActions",
				},
				{
					passes: content.includes("DataTable"),
					message: "entity table does not use shared DataTable",
				},
			];

			return checks.flatMap((check) =>
				check.passes ? [] : [`${path}:1:${check.message}`],
			);
		});
		const dataTable = readFileSync(
			"src/shared/components/data-table.tsx",
			"utf8",
		);

		if (!dataTable.includes("Nenhum registro encontrado.")) {
			violations.push(
				"src/shared/components/data-table.tsx:1:shared table empty state is missing",
			);
		}

		expect(violations).toEqual([]);
	});

	it("keeps entity routes declarative with validated search, loader prefetch, and overlays", () => {
		const routeFiles = [
			"src/routes/clientes.tsx",
			"src/routes/colaboradores.tsx",
			"src/routes/contratos.tsx",
			"src/routes/honorarios.tsx",
			"src/routes/remuneracoes.tsx",
		];
		const violations = routeFiles.flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const checks = [
				{
					passes: content.includes("validateSearch: zodValidator("),
					message: "route does not validate URL search",
				},
				{
					passes: content.includes("queryClient.ensureQueryData("),
					message: "route loader does not prefetch query data",
				},
				{
					passes: content.includes("useOverlay<"),
					message: "route does not use shared overlay orchestration",
				},
				{
					passes:
						content.includes("<Wrapper") && content.includes("<WrapperBody>"),
					message: "route does not use wrapper composition",
				},
			];

			return checks.flatMap((check) =>
				check.passes ? [] : [formatViolation(path, content, 0, check.message)],
			);
		});

		expect(violations).toEqual([]);
	});
});
