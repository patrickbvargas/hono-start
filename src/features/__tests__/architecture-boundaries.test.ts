import { readdirSync, readFileSync, statSync } from "node:fs";
import { sep } from "node:path";
import { describe, expect, it } from "vitest";

const sourceExtensions = [".ts", ".tsx"] as const;
const liveSourceRoots = ["src/features", "src/routes", "src/shared"] as const;

const featureInternalImportPattern =
	/@\/features\/([^/"']+)\/(api|components|constants|data|hooks|rules|schemas|utils)(?:\/[^"']*)?/g;
const vendorUiImportPattern =
	/from\s+["'](@radix-ui\/[^"']+|@base-ui\/[^"']+|react-aria-components|cmdk|vaul|react-day-picker|input-otp)["']/g;
const persistenceImportPattern =
	/from\s+["'](@\/shared\/lib\/prisma|@\/generated\/prisma(?:\/[^"']*)?)["']/g;

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

function isLiveSourceFile(path: string) {
	const normalizedPath = normalizePath(path);

	return (
		isSourceFile(path) &&
		!normalizedPath.includes("/__tests__/") &&
		!normalizedPath.endsWith(".test.ts") &&
		!normalizedPath.endsWith(".test.tsx")
	);
}

function getLine(content: string, index: number | undefined) {
	return content.slice(0, index).split("\n").length;
}

function listLiveSourceFiles(root: string) {
	return listFiles(root).filter(isLiveSourceFile);
}

function getFeatureNameFromPath(path: string) {
	const normalizedPath = normalizePath(path);
	const match = normalizedPath.match(/^src\/features\/([^/]+)\//);

	return match?.[1];
}

function formatViolation(
	path: string,
	content: string,
	index: number,
	detail: string,
) {
	return `${normalizePath(path)}:${getLine(content, index)}:${detail}`;
}

function isAllowedFeatureInternalImport(params: {
	path: string;
	targetFeature: string;
	targetArea: string;
	targetImport: string;
}) {
	const sourceFeature = getFeatureNameFromPath(params.path);
	const normalizedPath = normalizePath(params.path);

	if (sourceFeature === params.targetFeature) {
		return true;
	}

	return (
		params.targetImport === "@/features/audit-logs/data/mutations" &&
		normalizedPath.startsWith("src/features/") &&
		normalizedPath.endsWith("/data/mutations.ts")
	);
}

describe("architecture boundaries", () => {
	it("keeps routes from importing feature internals", () => {
		const violations = listLiveSourceFiles("src/routes").flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const matches = [...content.matchAll(featureInternalImportPattern)];

			return matches.map((match) =>
				formatViolation(
					path,
					content,
					match.index ?? 0,
					`route imports feature internal module ${match[0]}`,
				),
			);
		});

		expect(violations).toEqual([]);
	});

	it("keeps routes away from persistence modules", () => {
		const violations = listLiveSourceFiles("src/routes").flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const matches = [...content.matchAll(persistenceImportPattern)];

			return matches.map((match) =>
				formatViolation(
					path,
					content,
					match.index ?? 0,
					`route imports persistence module ${match[1]}`,
				),
			);
		});

		expect(violations).toEqual([]);
	});

	it("keeps feature and route UI primitive imports behind shared UI", () => {
		const violations = ["src/features", "src/routes"].flatMap((root) =>
			listLiveSourceFiles(root).flatMap((path) => {
				const content = readFileSync(path, "utf8");
				const matches = [...content.matchAll(vendorUiImportPattern)];

				return matches.map((match) =>
					formatViolation(
						path,
						content,
						match.index ?? 0,
						`import ${match[1]} through @/shared/components/ui or a documented shared composite`,
					),
				);
			}),
		);

		expect(violations).toEqual([]);
	});

	it("keeps shared code independent from feature modules", () => {
		const violations = listLiveSourceFiles("src/shared").flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const matches = [
				...content.matchAll(/from\s+["'](@\/features\/[^"']+)["']/g),
			];

			return matches.map((match) =>
				formatViolation(
					path,
					content,
					match.index ?? 0,
					`shared module imports feature module ${match[1]}`,
				),
			);
		});

		expect(violations).toEqual([]);
	});

	it("keeps cross-feature internal imports documented and narrow", () => {
		const violations = listLiveSourceFiles("src/features").flatMap((path) => {
			const content = readFileSync(path, "utf8");
			const matches = [...content.matchAll(featureInternalImportPattern)];

			return matches.flatMap((match) => {
				const targetFeature = match[1];
				const targetArea = match[2];
				const targetImport = match[0];

				if (!targetFeature || !targetArea) {
					return [];
				}

				if (
					isAllowedFeatureInternalImport({
						path,
						targetFeature,
						targetArea,
						targetImport,
					})
				) {
					return [];
				}

				return [
					formatViolation(
						path,
						content,
						match.index ?? 0,
						`feature imports another feature internal module ${targetImport}`,
					),
				];
			});
		});

		expect(violations).toEqual([]);
	});

	it("keeps live source files under the documented roots", () => {
		const scannedRoots = liveSourceRoots.map((root) => normalizePath(root));

		expect(scannedRoots).toEqual(["src/features", "src/routes", "src/shared"]);
	});
});
