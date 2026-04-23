import { describe, expect, it } from "vitest";
import { CLIENT_ERRORS } from "../constants/errors";
import {
	CLIENT_TYPE_COMPANY_VALUE,
	CLIENT_TYPE_INDIVIDUAL_VALUE,
} from "../constants/values";
import { assertCanBeDeleted } from "../rules/delete";
import { assertDocumentMatchesType } from "../rules/document";
import {
	assertTypeCanBeSelected,
	assertTypeExists,
	assertTypeImmutableOnUpdate,
} from "../rules/lookups";

const activeType = {
	id: 1,
	value: CLIENT_TYPE_INDIVIDUAL_VALUE,
	label: "Pessoa Física",
	isActive: true,
};

const inactiveType = {
	...activeType,
	isActive: false,
};

describe("client rule assertions", () => {
	it("accepts valid CPF and CNPJ documents for matching client types", () => {
		expect(() =>
			assertDocumentMatchesType({
				type: CLIENT_TYPE_INDIVIDUAL_VALUE,
				document: "529.982.247-25",
			}),
		).not.toThrow();

		expect(() =>
			assertDocumentMatchesType({
				type: CLIENT_TYPE_COMPANY_VALUE,
				document: "11.222.333/0001-81",
			}),
		).not.toThrow();
	});

	it("rejects invalid document semantics with safe messages", () => {
		expect(() =>
			assertDocumentMatchesType({
				type: CLIENT_TYPE_INDIVIDUAL_VALUE,
				document: "111.111.111-11",
			}),
		).toThrow(CLIENT_ERRORS.DOCUMENT_CPF_INVALID);

		expect(() =>
			assertDocumentMatchesType({
				type: CLIENT_TYPE_COMPANY_VALUE,
				document: "11.111.111/1111-11",
			}),
		).toThrow(CLIENT_ERRORS.DOCUMENT_CNPJ_INVALID);
	});

	it("blocks deletion when the client has active contracts", () => {
		expect(() =>
			assertCanBeDeleted({
				activeContractCount: 1,
			}),
		).toThrow(CLIENT_ERRORS.ALREADY_HAS_ACTIVE_CONTRACTS);

		expect(() =>
			assertCanBeDeleted({
				activeContractCount: 0,
			}),
		).not.toThrow();
	});

	it("validates lookup existence, activity, and immutability", () => {
		expect(() => assertTypeExists(null)).toThrow(CLIENT_ERRORS.TYPE_NOT_FOUND);
		expect(() => assertTypeExists(activeType)).not.toThrow();

		expect(() => assertTypeCanBeSelected(inactiveType)).toThrow(
			CLIENT_ERRORS.TYPE_INACTIVE,
		);
		expect(() =>
			assertTypeCanBeSelected(inactiveType, inactiveType.id),
		).not.toThrow();

		expect(() => assertTypeImmutableOnUpdate(activeType, 2)).toThrow(
			CLIENT_ERRORS.TYPE_NOT_MUTABLE,
		);
		expect(() =>
			assertTypeImmutableOnUpdate(activeType, activeType.id),
		).not.toThrow();
	});
});
