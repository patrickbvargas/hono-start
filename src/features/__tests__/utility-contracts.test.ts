import { afterEach, describe, expect, it, vi } from "vitest";
import {
	defaultContractCreateValues,
	defaultContractUpdateValues,
} from "@/features/contracts/utils/default";
import { normalizeOptionalText } from "@/features/contracts/utils/normalization";

import {
	defaultPersonCreateValues,
	defaultPersonUpdateValues,
} from "@/features/people/utils/default";
import {
	formatPersonDocument,
	getPersonDocumentLabel,
	getPersonDocumentPlaceholder,
	getPersonNameLabel,
} from "@/features/people/utils/format";
import {
	normalizePersonDocument,
	normalizePersonPhone,
} from "@/features/people/utils/normalization";

import { getBuiltInInputMaskDefinition } from "@/shared/lib/input-mask";

const timestamp = "2026-01-15T12:00:00.000Z";

const personDetail = {
	id: 1,
	fullName: "Maria Cliente",
	document: "52998224725",
	email: null,
	phone: null,
	typeId: 10,
	typeValue: "COMPANY",
	type: "Pessoa Jurídica",
	contractCount: 2,
	isGeneric: false,
	roles: ["customer"],
	isCustomer: true,
	isSupplier: false,
	isEmployee: false,
	isActive: false,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const contractDetail = {
	id: 3,
	processNumber: "0001234-56.2026.8.26.0001",
	clientId: 1,
	client: "Maria Cliente",
	lawyer: "João Advogado",
	legalAreaId: 40,
	legalArea: "Previdenciário",
	legalAreaValue: "SOCIAL_SECURITY",
	statusId: 50,
	status: "Ativo",
	statusValue: "ACTIVE",
	feePercentage: 0.3,
	assignmentCount: 1,
	revenueCount: 1,
	assignedEmployeeIds: [2],
	isAssignedToActor: true,
	isActive: true,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
	notes: null,
	allowStatusChange: false,
	assignments: [
		{
			id: 4,
			employeeId: 2,
			employeeName: "João Advogado",
			employeeType: "Advogado",
			employeeTypeValue: "LAWYER",
			assignmentType: "Responsável",
			assignmentTypeValue: "RESPONSIBLE",
			isActive: true,
			isSoftDeleted: false,
		},
	],
	revenues: [
		{
			id: 5,
			typeId: 60,
			type: "Honorários contratuais",
			typeValue: "CONTRACTUAL",
			totalValue: 10000,
			hasGeneratedTitles: false,
			downPaymentValue: null,
			paymentStartDate: timestamp,
			totalInstallments: 10,
			paidValue: 1000,
			installments: [],
			installmentsPaid: 1,
			nextInstallmentNumber: 2,
			nextDueDate: "2026-02-01",
			remainingValue: 9000,
			isFullyPaid: false,
			isActive: true,
			isSoftDeleted: false,
		},
	],
};

describe("feature utility contracts", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("keeps create defaults stable for entity forms", () => {
		expect(defaultPersonCreateValues()).toEqual({
			fullName: "",
			document: "",
			email: "",
			phone: "",
			type: "",
			isActive: true,
			isGeneric: false,
			isCustomer: true,
			isSupplier: false,
			isEmployee: false,
			employeeType: "",
			oabNumber: "",
			remunerationPercent: 0,
			referrerPercent: 0,
		});
		expect(defaultContractCreateValues()).toMatchObject({
			clientId: "",
			status: "ACTIVE",
			assignments: [],
			revenues: [],
		});
	});

	it("hydrates update defaults from UI-ready detail models", () => {
		expect(defaultPersonUpdateValues(personDetail)).toEqual({
			id: 1,
			fullName: "Maria Cliente",
			document: "52998224725",
			email: "",
			phone: "",
			type: "COMPANY",
			isActive: false,
			isGeneric: false,
			isCustomer: true,
			isSupplier: false,
			isEmployee: false,
			employeeType: "",
			oabNumber: "",
			remunerationPercent: 0,
			referrerPercent: 0,
		});
		expect(defaultContractUpdateValues(contractDetail)).toMatchObject({
			id: 3,
			clientId: "1",
			legalArea: "SOCIAL_SECURITY",
			status: "ACTIVE",
			notes: "",
			allowStatusChange: false,
			assignments: [{ id: 4, employeeId: "2", assignmentType: "RESPONSIBLE" }],
			revenues: [
				{
					id: 5,
					type: "CONTRACTUAL",
					notes: "",
				},
			],
		});
	});

	it("formats client document labels and masks by client type", () => {
		expect(formatPersonDocument(null)).toBe("—");
		expect(formatPersonDocument("52998224725")).toBe("529.982.247-25");
		expect(formatPersonDocument("12345678000195")).toBe("12.345.678/0001-95");
		expect(formatPersonDocument("ABC")).toBe("ABC");
		expect(getPersonNameLabel("COMPANY")).toBe("Razão Social");
		expect(getPersonDocumentLabel("COMPANY")).toBe("CNPJ");
		expect(getPersonDocumentPlaceholder("COMPANY")).toBe("00.000.000/0000-00");
		expect(getPersonNameLabel("INDIVIDUAL")).toBe("Nome");
		expect(getPersonDocumentLabel("INDIVIDUAL")).toBe("CPF");
	});

	it("normalizes optional text, client values, and fee references without business validation", () => {
		expect(normalizeOptionalText("  observação  ")).toBe("observação");
		expect(normalizeOptionalText("   ")).toBeNull();
		expect(normalizeOptionalText(null)).toBeNull();
		expect(normalizePersonDocument(" 529.982.247-25 ")).toBe("52998224725");
		expect(normalizePersonPhone(" (11) 99999-9999 ")).toBe("11999999999");
	});

	it("exposes built-in input mask definitions with aligned max lengths", () => {
		expect(getBuiltInInputMaskDefinition("cpf")).toEqual({
			mask: "999.999.999-99",
			maxLength: 14,
			options: {
				placeholder: "_",
				showMaskOnHover: false,
				showMaskOnFocus: true,
			},
		});
		expect(getBuiltInInputMaskDefinition("cnpj")).toEqual({
			mask: "99.999.999/9999-99",
			maxLength: 18,
			options: {
				placeholder: "_",
				showMaskOnHover: false,
				showMaskOnFocus: true,
			},
		});
		expect(getBuiltInInputMaskDefinition("phoneBr")).toEqual({
			mask: "(99) 9999[9]-9999",
			maxLength: 15,
			options: {
				placeholder: "_",
				showMaskOnHover: false,
				showMaskOnFocus: true,
			},
		});
	});
});
