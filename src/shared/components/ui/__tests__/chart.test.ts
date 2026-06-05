import { describe, expect, it } from "vitest";
import type { ChartConfig } from "../chart";
import { getPayloadColor } from "../chart";

describe("getPayloadColor", () => {
	it("prefers the configured chart color over the recharts legend payload color", () => {
		const config = {
			ADMINISTRATIVE: {
				label: "Administrativo",
				color: "rgb(255, 0, 0)",
			},
		} satisfies ChartConfig;

		const color = getPayloadColor(
			config,
			{
				value: "Administrativo",
				color: "rgb(128, 128, 128)",
				payload: {
					value: "ADMINISTRATIVE",
					fill: "rgb(0, 0, 255)",
				},
			},
			"ADMINISTRATIVE",
		);

		expect(color).toBe("rgb(255, 0, 0)");
	});
});
