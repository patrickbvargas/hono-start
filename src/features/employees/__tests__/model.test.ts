import { describe, expect, it } from "vitest";
import { employeeDetailSchema, employeeSummarySchema } from "../schemas/model";

describe("employee model schemas", () => {
	it("accepts the detail model used by edit and details hydration", () => {
		const result = employeeDetailSchema.safeParse({
			id: 1,
			fullName: "Maria Silva",
			email: "maria@example.com",
			oabNumber: "RS123456",
			remunerationPercent: 0.4,
			referrerPercent: 0.2,
			typeId: 1,
			type: "Advogado",
			typeValue: "LAWYER",
			roleId: 1,
			role: "Usuário",
			roleValue: "USER",
			contractCount: 3,
			isActive: true,
			isSoftDeleted: false,
			createdAt: "2026-04-17T00:00:00.000Z",
			updatedAt: "2026-04-17T01:00:00.000Z",
		});

		expect(result.success).toBe(true);
	});

	it("keeps the summary model limited to list fields", () => {
		const result = employeeSummarySchema.safeParse({
			id: 1,
			fullName: "Maria Silva",
			oabNumber: "RS123456",
			remunerationPercent: 0.4,
			type: "Advogado",
			role: "Usuário",
			contractCount: 3,
			isActive: true,
			isSoftDeleted: false,
		});

		expect(result.success).toBe(true);
		expect(result.data).not.toHaveProperty("email");
		expect(result.data).not.toHaveProperty("typeValue");
	});
});
