import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const features = [
	"clients",
	"employees",
	"contracts",
	"expenses",
	"fees",
	"remunerations",
	"audit-logs",
];

function readDetails(feature: string) {
	return readFileSync(
		`src/features/${feature}/components/details/index.tsx`,
		"utf8",
	);
}

describe("detail skeleton layout contracts", () => {
	it.each(features)("matches fixed field groups in %s", (feature) => {
		const content = readDetails(feature);
		const fallback = content.slice(content.indexOf("DetailsFallback ="));
		const groups = [
			...content.matchAll(
				/const (\w+Info) = React.useMemo<DetailFieldItem\[\]>\(\s*\(\) => \[([\s\S]*?)\],/g,
			),
		];
		const expected = groups.map(
			(group) => (group[2].match(/term:/g) ?? []).length,
		);
		const actual = [
			...fallback.matchAll(/SkeletonFields\s+columns=\{2\}\s+rows=\{(\d+)\}/g),
		].map((match) => Number(match[1]));
		// Contract teams/revenues and audit payloads have data-dependent lengths.
		if (feature === "contracts") {
			expect(actual[0]).toBe(expected[0]);
			expect(actual.at(-1)).toBe(expected.at(-1));
		} else if (feature === "audit-logs") {
			expect(actual[0]).toBe(expected[0]);
		} else {
			expect(actual).toEqual(expected);
		}
	});
	it.each(features)(
		"preserves fixed section order and matching header in %s",
		(feature) => {
			const content = readDetails(feature);
			const split = content.indexOf("DetailsFallback =");
			const real = content.slice(0, split);
			const fallback = content.slice(split);
			const titles = (text: string) =>
				[...text.matchAll(/EntityDetail.Section title="([^"]+)"/g)].map(
					(match) => match[1],
				);
			if (feature !== "audit-logs") {
				expect(titles(fallback)).toEqual(titles(real));
				expect(fallback).toContain(
					"<EntityDetail.SkeletonHeader withActions />",
				);
			} else {
				expect(fallback).toContain("<EntityDetail.SkeletonHeader />");
			}
			if (feature === "expenses") {
				const observation = fallback
					.split('title="Observação"')[1]
					.split("</EntityDetail.Section>")[0];
				expect(observation).not.toContain("SkeletonFields");
			}
		},
	);
});
