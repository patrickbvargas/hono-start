import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const featureRoot = "src/features";
const sourceExtensions = [".ts", ".tsx"] as const;
const allowedFeatureIndexes = new Set([
	"clients/index.ts",
	"contracts/index.ts",
	"employees/index.ts",
	"fees/index.ts",
	"remunerations/index.ts",
]);

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

function isSourceFile(path: string) {
	return sourceExtensions.some((extension) => path.endsWith(extension));
}

function getLine(content: string, index: number | undefined) {
	return content.slice(0, index).split("\n").length;
}

describe("feature boilerplate conventions", () => {
	it("keeps only top-level feature public barrels", () => {
		const nestedIndexes = listFiles(featureRoot)
			.filter(isSourceFile)
			.flatMap((path) => {
				const normalizedPath = normalizePath(relative(featureRoot, path));

				if (
					!normalizedPath.endsWith("/index.ts") &&
					!normalizedPath.endsWith("/index.tsx")
				) {
					return [];
				}

				if (allowedFeatureIndexes.has(normalizedPath)) {
					return [];
				}

				const content = readFileSync(path, "utf8");
				const nonEmptyLines = content
					.split("\n")
					.map((line) => line.trim())
					.filter(Boolean);
				const isReExportOnlyBarrel = nonEmptyLines.every((line) =>
					/^export\s+(\*|\{)/.test(line),
				);

				return isReExportOnlyBarrel ? [normalizedPath] : [];
			});

		expect(nestedIndexes).toEqual([]);
	});

	it("uses braced if statements in feature source files", () => {
		const bracelessIfPattern =
			/^\s*if\s*\([^)]*\)\s*(?!\{)(return|throw|continue|break|[A-Za-z_$][\w$.]*\s*(=|\())/gm;

		const violations = listFiles(featureRoot)
			.filter(isSourceFile)
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");
				const matches = [...content.matchAll(bracelessIfPattern)];

				return matches.map((match) => {
					const line = getLine(content, match.index);
					return `${normalizePath(path)}:${line}:${match[0].trim()}`;
				});
			});

		expect(violations).toEqual([]);
	});

	it("keeps component props interfaces local to feature components", () => {
		const exportedPropsPattern = /^\s*export\s+(interface|type)\s+\w+Props\b/gm;

		const violations = listFiles(featureRoot)
			.filter((path) => normalizePath(path).includes("/components/"))
			.filter(isSourceFile)
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");
				const matches = [...content.matchAll(exportedPropsPattern)];

				return matches.map((match) => {
					const line = getLine(content, match.index);
					return `${normalizePath(path)}:${line}:${match[0].trim()}`;
				});
			});

		expect(violations).toEqual([]);
	});

	it("uses canonical option-factory suffixes in feature API modules", () => {
		const optionFactoryPattern =
			/^\s*export\s+const\s+(\w+Options)\s*=\s*\(\)\s*=>|^\s*export\s+const\s+(\w+Options)\s*=\s*\([^)]*\)\s*=>/gm;

		const violations = listFiles(featureRoot)
			.filter((path) => normalizePath(path).includes("/api/"))
			.filter(isSourceFile)
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");
				const matches = [...content.matchAll(optionFactoryPattern)];

				return matches
					.map((match) => match[1] ?? match[2])
					.filter(
						(name) =>
							!name.endsWith("QueryOptions") &&
							!name.endsWith("MutationOptions"),
					)
					.map((name) => {
						const line = getLine(content, content.indexOf(name));
						return `${normalizePath(path)}:${line}:${name}`;
					});
			});

		expect(violations).toEqual([]);
	});

	it("keeps rules exports limited to throwing assert functions", () => {
		const rulesExportPattern =
			/^\s*export\s+(function|const|interface|type)\s+(\w+)/gm;

		const violations = listFiles(featureRoot)
			.filter((path) => normalizePath(path).includes("/rules/"))
			.filter(isSourceFile)
			.flatMap((path) => {
				const content = readFileSync(path, "utf8");
				const matches = [...content.matchAll(rulesExportPattern)];

				return matches
					.filter(
						(match) =>
							match[1] !== "function" || !match[2].startsWith("assert"),
					)
					.map((match) => {
						const line = getLine(content, match.index);
						return `${normalizePath(path)}:${line}:${match[0].trim()}`;
					});
			});

		expect(violations).toEqual([]);
	});
});
