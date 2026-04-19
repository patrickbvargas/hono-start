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

describe("feature boilerplate conventions", () => {
	it("keeps only top-level feature public barrels", () => {
		const nestedIndexes = listFiles(featureRoot)
			.filter(isSourceFile)
			.map((path) => normalizePath(relative(featureRoot, path)))
			.filter(
				(path) => path.endsWith("/index.ts") || path.endsWith("/index.tsx"),
			)
			.filter((path) => !allowedFeatureIndexes.has(path));

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
					const line = content.slice(0, match.index).split("\n").length;
					return `${normalizePath(path)}:${line}:${match[0].trim()}`;
				});
			});

		expect(violations).toEqual([]);
	});
});
