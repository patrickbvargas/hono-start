import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("breakdown chart theme", () => {
	it("uses the same theme palette for bars, sectors and legend", () => {
		const source = readFileSync(
			new URL("../components/breakdown-chart/index.tsx", import.meta.url),
			"utf8",
		);
		expect(source).toContain(
			"<Cell key={item.value} fill={getBreakdownColor(index)} />",
		);
		expect(source).toContain("backgroundColor: getBreakdownColor(index)");
		expect(source).toContain("fill={getBreakdownColor(props.index)}");
		for (let index = 1; index <= 5; index++) {
			expect(source).toContain(`var(--chart-${index})`);
		}
	});
});
