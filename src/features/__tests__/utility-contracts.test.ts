import { afterEach, describe, expect, it, vi } from "vitest";
import {
	defaultClientCreateValues,
	defaultClientUpdateValues,
} from "@/features/clients/utils/default";
import {
	formatClientDocument,
	getClientDocumentLabel,
	getClientDocumentPlaceholder,
	getClientNameLabel,
} from "@/features/clients/utils/format";
import {
	defaultContractCreateValues,
	defaultContractUpdateValues,
} from "@/features/contracts/utils/default";
import { normalizeOptionalText } from "@/features/contracts/utils/normalization";
import {
	defaultFeeCreateValues,
	defaultFeeUpdateValues,
} from "@/features/fees/utils/default";
import {
	normalizeFeeDateFilter,
	normalizeFeeReference,
} from "@/features/fees/utils/normalization";
import { defaultRemunerationUpdateValues } from "@/features/remunerations/utils/default";
import {
	buildRemunerationPdf,
	buildRemunerationSpreadsheet,
	createRemunerationExportFileName,
} from "@/features/remunerations/utils/export";

const timestamp = "2026-01-15T12:00:00.000Z";

const clientDetail = {
	id: 1,
	fullName: "Maria Cliente",
	document: "52998224725",
	email: null,
	phone: null,
	typeId: 10,
	typeValue: "COMPANY",
	type: "Pessoa Jurídica",
	contractCount: 2,
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
			downPaymentValue: null,
			paymentStartDate: timestamp,
			totalInstallments: 10,
			paidValue: 1000,
			installmentsPaid: 1,
			remainingValue: 9000,
			isFullyPaid: false,
			isActive: true,
			isSoftDeleted: false,
		},
	],
};

const feeDetail = {
	id: 6,
	contractId: 3,
	contractProcessNumber: "0001234-56.2026.8.26.0001",
	client: "Maria Cliente",
	contractStatusValue: "ACTIVE",
	revenueId: 5,
	revenueType: "Honorários contratuais",
	revenueTypeValue: "CONTRACTUAL",
	paymentDate: timestamp,
	amount: 1234.56,
	installmentNumber: 1,
	generatesRemuneration: false,
	remunerationCount: 1,
	isActive: false,
	isSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

const remuneration = {
	id: 7,
	contractEmployeeId: 4,
	employeeId: 2,
	employeeName: `João "Teste" (Advogado) \\ Silva`,
	client: "Maria Cliente",
	contractId: 3,
	contractProcessNumber: "0001234-56.2026.8.26.0001",
	feeId: 6,
	feeAmount: 1234.56,
	feeInstallmentNumber: 1,
	paymentDate: timestamp,
	amount: 370.37,
	effectivePercentage: 0.3,
	isManualOverride: false,
	isSystemGenerated: true,
	isActive: true,
	isSoftDeleted: false,
	parentFeeIsSoftDeleted: false,
	createdAt: timestamp,
	updatedAt: timestamp,
};

describe("feature utility contracts", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("keeps create defaults stable for entity forms", () => {
		expect(defaultClientCreateValues()).toEqual({
			fullName: "",
			document: "",
			email: "",
			phone: "",
			type: "",
			isActive: true,
		});
		expect(defaultContractCreateValues()).toMatchObject({
			clientId: "",
			status: "ACTIVE",
			assignments: [{ employeeId: "", assignmentType: "", isActive: true }],
			revenues: [{ type: "", totalInstallments: 1, isActive: true }],
		});
		expect(defaultFeeCreateValues()).toEqual({
			contractId: "",
			revenueId: "",
			paymentDate: "",
			amount: 0,
			installmentNumber: 1,
			generatesRemuneration: true,
			isActive: true,
		});
	});

	it("hydrates update defaults from UI-ready detail models", () => {
		expect(defaultClientUpdateValues(clientDetail)).toEqual({
			id: 1,
			fullName: "Maria Cliente",
			document: "52998224725",
			email: "",
			phone: "",
			type: "COMPANY",
			isActive: false,
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
					paymentStartDate: "2026-01-15",
				},
			],
		});
		expect(defaultFeeUpdateValues(feeDetail)).toEqual({
			id: 6,
			contractId: "3",
			revenueId: "5",
			paymentDate: "2026-01-15",
			amount: 1234.56,
			installmentNumber: 1,
			generatesRemuneration: false,
			isActive: false,
		});
		expect(defaultRemunerationUpdateValues(remuneration)).toEqual({
			id: 7,
			amount: 370.37,
			effectivePercentage: 0.3,
		});
	});

	it("formats client document labels and masks by client type", () => {
		expect(formatClientDocument(null)).toBe("—");
		expect(formatClientDocument("52998224725")).toBe("529.982.247-25");
		expect(formatClientDocument("12345678000195")).toBe("12.345.678/0001-95");
		expect(formatClientDocument("ABC")).toBe("ABC");
		expect(getClientNameLabel("COMPANY")).toBe("Razão Social");
		expect(getClientDocumentLabel("COMPANY")).toBe("CNPJ");
		expect(getClientDocumentPlaceholder("COMPANY")).toBe("00.000.000/0000-00");
		expect(getClientNameLabel("INDIVIDUAL")).toBe("Nome");
		expect(getClientDocumentLabel("INDIVIDUAL")).toBe("CPF");
	});

	it("normalizes optional text and fee references without business validation", () => {
		expect(normalizeOptionalText("  observação  ")).toBe("observação");
		expect(normalizeOptionalText("   ")).toBeNull();
		expect(normalizeOptionalText(null)).toBeNull();
		expect(normalizeFeeReference("  123  ")).toBe("123");
		expect(normalizeFeeDateFilter("  2026-01-15  ")).toBe("2026-01-15");
	});

	it("builds escaped remuneration spreadsheet and PDF exports", () => {
		const csv = buildRemunerationSpreadsheet([remuneration]);

		expect(csv).toContain('"Colaborador","Contrato","Pagamento"');
		expect(csv).toContain('"João ""Teste"" (Advogado) \\ Silva"');
		expect(csv).toContain('"R$');
		expect(csv).toContain('"30%"');
		expect(csv).toContain('"Automática"');
		expect(csv).toContain('"Ativa"');

		const pdf = buildRemunerationPdf([remuneration]).toString("utf8");

		expect(pdf).toContain("%PDF-1.4");
		expect(pdf).toContain("Relatório de remunerações");
		expect(pdf).toContain('João "Teste" \\(Advogado\\) \\\\ Silva');
	});

	it("creates dated remuneration export filenames", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-23T12:00:00.000Z"));

		expect(createRemunerationExportFileName("pdf")).toBe(
			"remuneracoes-2026-04-23.pdf",
		);
		expect(createRemunerationExportFileName("spreadsheet")).toBe(
			"remuneracoes-2026-04-23.csv",
		);
	});
});
