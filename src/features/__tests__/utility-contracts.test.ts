import pdfmake from "pdfmake";
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
	normalizeClientDocument,
	normalizeClientPhone,
} from "@/features/clients/utils/normalization";
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
	buildRemunerationPdfDefinition,
	buildRemunerationSpreadsheet,
	buildRemunerationSpreadsheetBuffer,
	createRemunerationExportFileName,
} from "@/features/remunerations/utils/export";
import { getBuiltInInputMaskDefinition } from "@/shared/lib/input-mask";

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

	it("normalizes optional text, client values, and fee references without business validation", () => {
		expect(normalizeOptionalText("  observação  ")).toBe("observação");
		expect(normalizeOptionalText("   ")).toBeNull();
		expect(normalizeOptionalText(null)).toBeNull();
		expect(normalizeClientDocument(" 529.982.247-25 ")).toBe("52998224725");
		expect(normalizeClientPhone(" (11) 99999-9999 ")).toBe("11999999999");
		expect(normalizeFeeReference("  123  ")).toBe("123");
		expect(normalizeFeeDateFilter("  2026-01-15  ")).toBe("2026-01-15");
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
			mask: ["(99) 9999-9999", "(99) 99999-9999"],
			maxLength: 15,
			options: {
				placeholder: "_",
				showMaskOnHover: false,
				showMaskOnFocus: true,
			},
		});
	});

	it("builds remuneration spreadsheet output with UTF-16LE BOM support", () => {
		const csv = buildRemunerationSpreadsheet([remuneration]);
		const csvBuffer = buildRemunerationSpreadsheetBuffer([remuneration]);

		expect(csv).toContain('"sep=;"');
		expect(csv).toContain(
			'"Colaborador";"Cliente";"Processo";"Nº parcela";"Competência";"%";"Origem";"Situação";"Valor"',
		);
		expect(csv).toContain(
			'"João ""Teste"" (Advogado) \\ Silva";"Maria Cliente"',
		);
		expect(csv).toContain('"R$');
		expect(csv).toContain('"30%"');
		expect(csv).toContain('"Automática"');
		expect(csv).toContain('"Ativa"');
		expect(csvBuffer.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xfe]));
		expect(csvBuffer.subarray(2).toString("utf16le")).toBe(csv);
	});

	it("builds structured remuneration PDF definitions with totals", async () => {
		const pdfDefinition = buildRemunerationPdfDefinition([remuneration], {
			generatedAt: new Date("2026-01-15T12:00:00.000Z"),
		});
		const pdf = await buildRemunerationPdf([remuneration]);

		expect(pdf.subarray(0, 8).toString()).toBe("%PDF-1.3");
		expect(pdf.length).toBeGreaterThan(1000);
		expect(pdfmake.virtualfs.existsSync("Roboto-Regular.ttf")).toBe(true);
		expect(pdfmake.virtualfs.existsSync("Roboto-Medium.ttf")).toBe(true);
		expect(pdfDefinition.info?.title).toBe("Relatório de remunerações");
		expect(pdfDefinition.content).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: "Relatório de remunerações",
				}),
				expect.objectContaining({
					text: "Remunerações",
				}),
				expect.objectContaining({
					text: "Totais por colaborador",
				}),
			]),
		);
		expect(pdfDefinition.content).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stack: expect.arrayContaining([
						expect.objectContaining({
							text: "Registros exportados: 1",
						}),
						expect.objectContaining({
							text: "Valor total do período: R$ 370,37",
						}),
					]),
				}),
			]),
		);
		expect(JSON.stringify(pdfDefinition)).toContain('"Valor total"');
		expect(JSON.stringify(pdfDefinition)).toContain("R$ 370,37");
		expect(JSON.stringify(pdfDefinition)).toContain(
			'João \\"Teste\\" (Advogado) \\\\ Silva',
		);
		expect(JSON.stringify(pdfDefinition)).toContain("Maria Cliente");
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
