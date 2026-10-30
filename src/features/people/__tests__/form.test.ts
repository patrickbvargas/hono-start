import { describe, expect, it } from "vitest";
import { personCreateInputSchema } from "../schemas/form";
import { defaultPersonCreateValues } from "../utils/default";

const ordinary = {
	...defaultPersonCreateValues(),
	fullName: "Pessoa de teste",
	type: "INDIVIDUAL",
	document: "529.982.247-25",
};
describe("person input invariants", () => {
	it("normalizes a real document and preserves cumulative roles", () => {
		const result = personCreateInputSchema.parse({
			...ordinary,
			isSupplier: true,
		});
		expect(result.document).toBe("52998224725");
		expect(result.isCustomer).toBe(true);
		expect(result.isSupplier).toBe(true);
	});
	it("rejects missing or invalid ordinary documents", () => {
		expect(
			personCreateInputSchema.safeParse({ ...ordinary, document: "" }).success,
		).toBe(false);
		expect(
			personCreateInputSchema.safeParse({
				...ordinary,
				document: "11111111111",
			}).success,
		).toBe(false);
	});
	it("requires supplier and professional fields for employees", () => {
		expect(
			personCreateInputSchema.safeParse({
				...ordinary,
				isEmployee: true,
				isSupplier: false,
			}).success,
		).toBe(false);
		expect(
			personCreateInputSchema.safeParse({
				...ordinary,
				isEmployee: true,
				isSupplier: true,
				employeeType: "LAWYER",
				oabNumber: "",
			}).success,
		).toBe(false);
	});
	it("allows seeded generic shape but forbids generic employee/fake document", () => {
		const generic = { ...ordinary, isGeneric: true, document: "", type: "" };
		expect(personCreateInputSchema.safeParse(generic).success).toBe(true);
		expect(
			personCreateInputSchema.safeParse({
				...generic,
				isEmployee: true,
				isSupplier: true,
			}).success,
		).toBe(false);
		expect(
			personCreateInputSchema.safeParse({
				...generic,
				document: ordinary.document,
			}).success,
		).toBe(false);
	});
	it("rejects referral greater than remuneration", () => {
		expect(
			personCreateInputSchema.safeParse({
				...ordinary,
				isEmployee: true,
				isSupplier: true,
				employeeType: "ADMIN_ASSISTANT",
				remunerationPercent: 0.1,
				referrerPercent: 0.2,
			}).success,
		).toBe(false);
	});
});
