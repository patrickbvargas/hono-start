import { describe, expect, it } from "vitest";
import {
	CLIENT_TYPE_COMPANY_VALUE,
	CLIENT_TYPE_INDIVIDUAL_VALUE,
} from "../constants";
import { CLIENT_ERRORS } from "../constants/errors";
import { validateClientDocumentRules } from "../rules";

describe("validateClientDocumentRules", () => {
	it("returns required error when document is empty", () => {
		expect(
			validateClientDocumentRules({
				document: "",
				type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			}),
		).toEqual([
			{
				path: ["document"],
				message: CLIENT_ERRORS.CLIENT_DOCUMENT_REQUIRED,
			},
		]);
	});

	it("accepts a valid cpf for an individual client", () => {
		expect(
			validateClientDocumentRules({
				document: "529.982.247-25",
				type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			}),
		).toEqual([]);
	});

	it("rejects an invalid cpf for an individual client", () => {
		expect(
			validateClientDocumentRules({
				document: "111.111.111-11",
				type: CLIENT_TYPE_INDIVIDUAL_VALUE,
			}),
		).toEqual([
			{
				path: ["document"],
				message: CLIENT_ERRORS.CLIENT_DOCUMENT_CPF_INVALID,
			},
		]);
	});

	it("accepts a valid cnpj for a company client", () => {
		expect(
			validateClientDocumentRules({
				document: "04.252.011/0001-10",
				type: CLIENT_TYPE_COMPANY_VALUE,
			}),
		).toEqual([]);
	});

	it("rejects an invalid cnpj for a company client", () => {
		expect(
			validateClientDocumentRules({
				document: "11.111.111/1111-11",
				type: CLIENT_TYPE_COMPANY_VALUE,
			}),
		).toEqual([
			{
				path: ["document"],
				message: CLIENT_ERRORS.CLIENT_DOCUMENT_CNPJ_INVALID,
			},
		]);
	});

	it("rejects an unknown client type", () => {
		expect(
			validateClientDocumentRules({
				document: "52998224725",
				type: "UNKNOWN",
			}),
		).toEqual([
			{
				path: ["type"],
				message: CLIENT_ERRORS.CLIENT_TYPE_INVALID,
			},
		]);
	});
});
