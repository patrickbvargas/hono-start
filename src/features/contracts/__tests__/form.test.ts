import { describe, expect, it } from "vitest";
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	contractCreateInputSchema,
	contractUpdateInputSchema,
} from "../schemas/form";

function createValidPayload() {
	return {
		clientId: "1",
		processNumber: "  PROC-001  ",
		legalArea: "CIVIL",
		status: "ACTIVE",
		feePercentage: 0.3,
		notes: "  observacao  ",
		allowStatusChange: true,
		isActive: true,
		assignments: [
			{
				employeeId: "1",
				assignmentType: "RESPONSIBLE",
				isActive: true,
			},
		],
		revenues: [
			{
				type: "MONTHLY",
				totalValue: 1000,
				isActive: true,
			},
		],
	};
}

describe("contract form schemas", () => {
	it("accepts a valid create payload", () => {
		const result = contractCreateInputSchema.safeParse(createValidPayload());

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			clientId: "1",
			processNumber: "PROC-001",
			legalArea: "CIVIL",
			status: "ACTIVE",
			feePercentage: 0.3,
			notes: "observacao",
			allowStatusChange: true,
			isActive: true,
			assignments: [
				{
					employeeId: "1",
					assignmentType: "RESPONSIBLE",
					isActive: true,
				},
			],
			revenues: [
				{
					type: "MONTHLY",
					totalValue: 1000,
					isActive: true,
				},
			],
		});
	});

	it("rejects create payloads without an active assignment", () => {
		const result = contractCreateInputSchema.safeParse({
			...createValidPayload(),
			assignments: [
				{
					employeeId: "1",
					assignmentType: "RESPONSIBLE",
					isActive: false,
				},
			],
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_REQUIRED,
		);
	});

	it("rejects duplicate active revenue types on update", () => {
		const result = contractUpdateInputSchema.safeParse({
			id: 1,
			...createValidPayload(),
			revenues: [
				{
					type: "MONTHLY",
					totalValue: 1000,
					isActive: true,
				},
				{
					type: "MONTHLY",
					totalValue: 1200,
					isActive: true,
				},
			],
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_DUPLICATE,
		);
	});

	it("rejects nonpositive negotiated values on create", () => {
		const result = contractCreateInputSchema.safeParse({
			...createValidPayload(),
			revenues: [
				{
					type: "MONTHLY",
					totalValue: 0,
					isActive: true,
				},
			],
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			"Valor total deve ser maior que zero",
		);
	});
});
