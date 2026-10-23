import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("breakdown chart theme", () => {
	it("uses the theme palette for bars and donut sectors", () => {
		const source = readFileSync(
			new URL("../components/breakdown-chart/bar.tsx", import.meta.url),
			"utf8",
		);
		expect(source).toContain('fill="var(--color-total)"');
		expect(source).toContain(
			"<Cell key={item.value} fill={getBreakdownColor(index)} />",
		);
		expect(
			readFileSync(new URL("../constants/charts.ts", import.meta.url), "utf8"),
		).toContain('color: "var(--chart-1)"');
		expect(
			readFileSync(
				new URL("../components/breakdown-chart/donut.tsx", import.meta.url),
				"utf8",
			),
		).toContain("fill={getBreakdownColor(props.index)}");
		for (let index = 1; index <= 5; index++) {
			expect(
				readFileSync(new URL("../utils/breakdown.ts", import.meta.url), "utf8"),
			).toContain(`var(--chart-${index})`);
		}
	});
});
