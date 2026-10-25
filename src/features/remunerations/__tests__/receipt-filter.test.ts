import { describe, expect, it } from "vitest";
import { remunerationExportInputSchema } from "../schemas/form";
import { remunerationSearchSchema } from "../schemas/search";

describe("remuneration receipt filter", () => {
	it("parses an exact receipt ID through list and export contracts", () => {
		expect(remunerationSearchSchema.parse({ feeId: "125" }).feeId).toBe(125);
		expect(
			remunerationExportInputSchema.parse({ feeId: "125", format: "pdf" })
				.feeId,
		).toBe(125);
	});
	it.each([0, -1, 1.5, "bad", 2147483648])("ignores invalid ID %s", (feeId) => {
		expect(remunerationSearchSchema.parse({ feeId }).feeId).toBeUndefined();
	});
});
