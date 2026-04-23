import { readdirSync, readFileSync, statSync } from "node:fs";
import { sep } from "node:path";
import { describe, expect, it } from "vitest";

const featureRoot = "src/features";

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

describe("feature validation boundaries", () => {
	it("keeps form schemas database-free", () => {
		const forbiddenPatterns = [
			{
				pattern: /from\s+["']@\/shared\/lib\/prisma["']/g,
				message: "form schema imports Prisma client",
			},
			{
				pattern: /from\s+["']@\/generated\/prisma(?:\/[^"']*)?["']/g,
				message: "form schema imports generated Prisma types",
			},
			{
				pattern: /from\s+["'](?:\.\.\/data|\.\/data)(?:\/[^"']*)?["']/g,
				message: "form schema imports data access",
			},
		];
		const violations = listFiles(featureRoot)
			.filter((path) => normalizePath(path).endsWith("/schemas/form.ts"))
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");

				return forbiddenPatterns.flatMap(({ pattern, message }) =>
					[...content.matchAll(pattern)].map((match) =>
						formatViolation(path, content, match.index ?? 0, message),
					),
				);
			});

		expect(violations).toEqual([]);
	});

	it("keeps pure rules away from Prisma client and data access", () => {
		const forbiddenPatterns = [
			{
				pattern: /from\s+["']@\/shared\/lib\/prisma["']/g,
				message: "rule module imports Prisma client",
			},
			{
				pattern: /from\s+["'](?:\.\.\/data|\.\/data)(?:\/[^"']*)?["']/g,
				message: "rule module imports data access",
			},
		];
		const violations = listFiles(featureRoot)
			.filter((path) => normalizePath(path).includes("/rules/"))
			.filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");

				return forbiddenPatterns.flatMap(({ pattern, message }) =>
					[...content.matchAll(pattern)].map((match) =>
						formatViolation(path, content, match.index ?? 0, message),
					),
				);
			});

		expect(violations).toEqual([]);
	});

	it("keeps persisted lookup and lifecycle checks in data modules", () => {
		const dataModules = listFiles(featureRoot)
			.map(normalizePath)
			.filter((path) => path.includes("/data/"))
			.filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"));

		expect(dataModules).toEqual(
			expect.arrayContaining([
				"src/features/clients/data/mutations.ts",
				"src/features/employees/data/mutations.ts",
				"src/features/contracts/data/mutations.ts",
				"src/features/fees/data/mutations.ts",
				"src/features/remunerations/data/mutations.ts",
			]),
		);
	});
});
