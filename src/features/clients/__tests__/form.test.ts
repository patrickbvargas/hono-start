import { describe, expect, it } from "vitest";
import {
	CLIENT_TYPE_COMPANY_VALUE,
	CLIENT_TYPE_INDIVIDUAL_VALUE,
} from "../constants";
import { CLIENT_ERRORS } from "../constants/errors";
import {
	clientCreateInputSchema,
	clientUpdateInputSchema,
} from "../schemas/form";

describe("client form schemas", () => {
	it("accepts a valid create payload", () => {
		const result = clientCreateInputSchema.safeParse({
			fullName: "Maria Silva",
			document: "529.982.247-25",
			email: "  maria@example.com  ",
			phone: "  (11) 99999-9999  ",
			type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			isActive: true,
		});

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			fullName: "Maria Silva",
			document: "52998224725",
			email: "maria@example.com",
			phone: "(11) 99999-9999",
			type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			isActive: true,
		});
	});

	it("rejects an invalid cpf on create", () => {
		const result = clientCreateInputSchema.safeParse({
			fullName: "Maria Silva",
			document: "111.111.111-11",
			email: "maria@example.com",
			phone: "(11) 99999-9999",
			type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			CLIENT_ERRORS.CLIENT_DOCUMENT_CPF_INVALID,
		);
	});

	it("rejects an invalid cnpj on update", () => {
		const result = clientUpdateInputSchema.safeParse({
			id: 1,
			fullName: "Empresa LTDA",
			document: "11.111.111/1111-11",
			email: "empresa@example.com",
			phone: "(11) 3333-3333",
			type: CLIENT_TYPE_COMPANY_VALUE,
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			CLIENT_ERRORS.CLIENT_DOCUMENT_CNPJ_INVALID,
		);
	});

	it("normalizes empty optional text to null", () => {
		const result = clientCreateInputSchema.safeParse({
			fullName: "Maria Silva",
			document: "529.982.247-25",
			email: "   ",
			phone: "   ",
			type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			isActive: true,
		});

		expect(result.success).toBe(true);
		expect(result.data?.email).toBeNull();
		expect(result.data?.phone).toBeNull();
	});
});
