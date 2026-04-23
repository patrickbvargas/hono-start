import { readdirSync, readFileSync, statSync } from "node:fs";
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
