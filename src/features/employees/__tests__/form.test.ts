import { describe, expect, it } from "vitest";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import { LAWYER_TYPE_VALUE } from "../constants/values";
import {
	employeeCreateInputSchema,
	employeeUpdateInputSchema,
} from "../schemas/form";

describe("employee form schemas", () => {
	it("accepts a valid create payload", () => {
		const result = employeeCreateInputSchema.safeParse({
			fullName: "Maria Silva",
			email: "maria@example.com",
			oabNumber: "RS123456",
			remunerationPercent: 0.4,
			referrerPercent: 0.2,
			type: LAWYER_TYPE_VALUE,
			role: "USER",
			isActive: true,
		});

		expect(result.success).toBe(true);
	});

	it("rejects missing oab for lawyers on create", () => {
		const result = employeeCreateInputSchema.safeParse({
			fullName: "Maria Silva",
			email: "maria@example.com",
			oabNumber: "",
			remunerationPercent: 0.4,
			referrerPercent: 0.2,
			type: LAWYER_TYPE_VALUE,
			role: "USER",
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(EMPLOYEE_ERRORS.OAB_REQUIRED);
	});

	it("rejects referral percentage above remuneration percentage on update", () => {
		const result = employeeUpdateInputSchema.safeParse({
			id: 1,
			fullName: "Maria Silva",
			email: "maria@example.com",
			oabNumber: "RS123456",
			remunerationPercent: 0.2,
			referrerPercent: 0.3,
			type: LAWYER_TYPE_VALUE,
			role: "USER",
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			EMPLOYEE_ERRORS.REFERRAL_PERCENTAGE_TOO_HIGH,
		);
	});
});
