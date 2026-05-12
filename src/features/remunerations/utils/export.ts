import { resolve } from "node:path";
import pdfmake from "pdfmake";
import { formatter } from "@/shared/lib/formatter";
import type { Remuneration } from "../schemas/model";

interface RemunerationExportRow {
	employee: string;
	client: string;
	contract: string;
	paymentDate: string;
	amount: string;
	amountValue: number;
	effectivePercentage: string;
	overrideState: string;
	activeState: string;
	createdAt: string;
	installmentNumber: string;
}

interface RemunerationEmployeeTotal {
	employee: string;
	amount: number;
	formattedAmount: string;
}

interface RemunerationReportSummary {
	generatedAt: string;
	totalRecords: number;
	totalAmount: number;
	formattedTotalAmount: string;
	employeeTotals: RemunerationEmployeeTotal[];
}

interface TableNode {
	layout?: string | Record<string, unknown>;
	table: {
		body: Array<Array<string | Record<string, unknown>>>;
		headerRows?: number;
		widths?: Array<number | "*" | "auto">;
	};
}

interface PdfTextNode {
	alignment?: "left" | "center" | "right";
	bold?: boolean;
	color?: string;
	fontSize?: number;
	margin?: [number, number, number, number];
	style?: string;
	text: string;
}

interface PdfStackNode {
	margin?: [number, number, number, number];
	stack: Array<PdfTextNode | TableNode>;
	style?: string;
}

interface PdfDocumentDefinition {
	content: Array<PdfTextNode | PdfStackNode | TableNode>;
	defaultStyle?: {
		font?: string;
		fontSize?: number;
	};
	footer?: (currentPage: number, pageCount: number) => PdfTextNode;
	info?: {
		author?: string;
		subject?: string;
		title?: string;
	};
	pageOrientation?: "landscape" | "portrait";
	pageMargins?: [number, number, number, number];
	pageSize?: "A4";
	styles?: Record<string, Record<string, unknown>>;
}

const UTF16LE_BOM = Buffer.from([0xff, 0xfe]);
const PDF_FONT_FILES = {
	normal: "C:/Windows/Fonts/arial.ttf",
	bold: "C:/Windows/Fonts/arialbd.ttf",
	italics: "C:/Windows/Fonts/ariali.ttf",
	bolditalics: "C:/Windows/Fonts/arialbi.ttf",
} as const;

pdfmake.addFonts({
	Arial: {
		normal: PDF_FONT_FILES.normal,
		bold: PDF_FONT_FILES.bold,
		italics: PDF_FONT_FILES.italics,
		bolditalics: PDF_FONT_FILES.bolditalics,
	},
});
pdfmake.setUrlAccessPolicy(() => {
	return false;
});
pdfmake.setLocalAccessPolicy((targetPath) => {
	const resolvedTargetPath = resolve(targetPath).toLowerCase();

	return Object.values(PDF_FONT_FILES).some((fontPath) => {
		return resolve(fontPath).toLowerCase() === resolvedTargetPath;
	});
});

function escapeCsvValue(value: string) {
	return `"${value.replaceAll(`"`, `""`)}"`;
}

const SPREADSHEET_DELIMITER = ";";

function toExportRows(remunerations: Remuneration[]): RemunerationExportRow[] {
	return remunerations.map((remuneration) => ({
		employee: remuneration.employeeName,
		client: remuneration.client,
		contract: remuneration.contractProcessNumber,
		paymentDate: formatter.date(remuneration.paymentDate),
		amount: formatter.currency(remuneration.amount),
		amountValue: remuneration.amount,
		effectivePercentage: formatter.percent(remuneration.effectivePercentage),
		overrideState: remuneration.isManualOverride ? "Manual" : "Automática",
		activeState: remuneration.isSoftDeleted
			? "Excluída"
			: remuneration.isActive
				? "Ativa"
				: "Inativa",
		createdAt: formatter.date(remuneration.createdAt),
		installmentNumber: String(remuneration.feeInstallmentNumber),
	}));
}

function buildRemunerationReportSummary(
	rows: RemunerationExportRow[],
	generatedAt: Date,
): RemunerationReportSummary {
	const employeeTotalsMap = new Map<string, number>();

	for (const row of rows) {
		const currentAmount = employeeTotalsMap.get(row.employee) ?? 0;
		employeeTotalsMap.set(row.employee, currentAmount + row.amountValue);
	}

	const totalAmount = rows.reduce((sum, row) => sum + row.amountValue, 0);
	const employeeTotals = Array.from(employeeTotalsMap.entries())
		.map(([employee, amount]) => ({
			employee,
			amount,
			formattedAmount: formatter.currency(amount),
		}))
		.sort((left, right) => {
			if (right.amount !== left.amount) {
				return right.amount - left.amount;
			}

			return left.employee.localeCompare(right.employee, "pt-BR");
		});

	return {
		generatedAt: new Intl.DateTimeFormat("pt-BR", {
			dateStyle: "short",
			timeStyle: "short",
		}).format(generatedAt),
		totalRecords: rows.length,
		totalAmount,
		formattedTotalAmount: formatter.currency(totalAmount),
		employeeTotals,
	};
}

export function buildRemunerationSpreadsheet(remunerations: Remuneration[]) {
	const rows = toExportRows(remunerations);
	const header = [
		"Colaborador",
		"Cliente",
		"Contrato",
		"Parcela",
		"Pagamento",
		"%",
		"Origem",
		"Situação",
		"Valor",
	];
	const body = rows.map((row) => [
		row.employee,
		row.client,
		row.contract,
		row.installmentNumber,
		row.paymentDate,
		row.effectivePercentage,
		row.overrideState,
		row.activeState,
		row.amount,
	]);

	return [["sep=;"], header, ...body]
		.map((line) => line.map(escapeCsvValue).join(SPREADSHEET_DELIMITER))
		.join("\n");
}

export function buildRemunerationSpreadsheetBuffer(
	remunerations: Remuneration[],
) {
	return Buffer.concat([
		UTF16LE_BOM,
		Buffer.from(buildRemunerationSpreadsheet(remunerations), "utf16le"),
	]);
}

export function buildRemunerationPdfDefinition(
	remunerations: Remuneration[],
	options?: {
		generatedAt?: Date;
	},
): PdfDocumentDefinition {
	const rows = toExportRows(remunerations);
	const generatedAt = options?.generatedAt ?? new Date();
	const summary = buildRemunerationReportSummary(rows, generatedAt);

	const tableBody: TableNode["table"]["body"] = [
		[
			{ text: "Colaborador", style: "tableHeader" },
			{ text: "Cliente", style: "tableHeader" },
			{ text: "Contrato", style: "tableHeader" },
			{ text: "Parcela", style: "tableHeader", alignment: "center" },
			{ text: "Pagamento", style: "tableHeader" },
			{ text: "%", style: "tableHeader", alignment: "center" },
			{ text: "Origem", style: "tableHeader" },
			{ text: "Situação", style: "tableHeader" },
			{ text: "Valor", style: "tableHeader" },
		],
		...rows.map((row) => [
			{ text: row.employee, style: "tableCell" },
			{ text: row.client, style: "tableCell" },
			{ text: row.contract, style: "tableCell" },
			{ text: row.installmentNumber, style: "tableCell", alignment: "center" },
			{ text: row.paymentDate, style: "tableCell" },
			{
				text: row.effectivePercentage,
				style: "tableCell",
				alignment: "center",
			},
			{ text: row.overrideState, style: "tableCell" },
			{ text: row.activeState, style: "tableCell" },
			{ text: row.amount, style: "tableCell", alignment: "right" },
		]),
	];

	const employeeTotalsBody: TableNode["table"]["body"] = [
		[
			{ text: "Colaborador", style: "tableHeader" },
			{ text: "Subtotal", style: "tableHeader", alignment: "right" },
		],
		...summary.employeeTotals.map((employeeTotal) => [
			{ text: employeeTotal.employee, style: "tableCell" },
			{
				text: employeeTotal.formattedAmount,
				style: "tableCell",
				alignment: "right",
			},
		]),
		[
			{ text: "Subtotal", style: "tableHeader" },
			{
				text: summary.formattedTotalAmount,
				style: "tableHeader",
				alignment: "right",
			},
		],
	];

	return {
		pageSize: "A4",
		pageOrientation: "landscape",
		pageMargins: [28, 36, 28, 36],
		info: {
			title: "Relatório de remunerações",
			author: "Hono",
			subject: "Exportação de remunerações",
		},
		defaultStyle: {
			font: "Arial",
			fontSize: 8,
		},
		styles: {
			title: {
				bold: true,
				fontSize: 18,
				color: "#121212",
			},
			sectionTitle: {
				bold: true,
				fontSize: 11,
				color: "#121212",
			},
			metaLabel: {
				bold: true,
				color: "#121212",
			},
			tableHeader: {
				bold: true,
				fontSize: 8,
				color: "#121212",
				fillColor: "#f5f5f5",
				margin: [3, 3, 3, 3],
			},
			tableCell: {
				margin: [3, 2, 3, 2],
			},
		},
		footer: (currentPage, pageCount) => ({
			text: `Página ${currentPage} de ${pageCount}`,
			alignment: "right",
			margin: [0, 0, 28, 12],
			fontSize: 8,
			color: "#121212",
		}),
		content: [
			{
				text: "Relatório de remunerações",
				style: "title",
				margin: [0, 0, 0, 8],
			},
			{
				text: `Gerado em ${summary.generatedAt}`,
				color: "#121212",
				margin: [0, 0, 0, 12],
			},
			{
				margin: [0, 0, 0, 14],
				stack: [
					{
						text: `Registros exportados: ${summary.totalRecords}`,
						style: "metaLabel",
						margin: [0, 0, 0, 4],
					},
					{
						text: `Total do período: ${summary.formattedTotalAmount}`,
						style: "metaLabel",
					},
				],
			},
			{
				text: "Remunerações",
				style: "sectionTitle",
				margin: [0, 0, 0, 8],
			},
			{
				layout: "noBorders",
				table: {
					headerRows: 1,
					widths: ["*", "*", "*", 40, 50, 25, 60, 40, 60],
					body: tableBody,
				},
			},
			{
				text: "Totais por colaborador",
				style: "sectionTitle",
				margin: [0, 16, 0, 8],
			},
			{
				layout: "noBorders",
				table: {
					headerRows: 1,
					widths: ["*", 60],
					body: employeeTotalsBody,
				},
			},
		],
	};
}

export async function buildRemunerationPdf(remunerations: Remuneration[]) {
	const document = pdfmake.createPdf(
		buildRemunerationPdfDefinition(remunerations),
	);

	return document.getBuffer();
}

export function createRemunerationExportFileName(
	format: "pdf" | "spreadsheet",
) {
	const now = new Date().toISOString().slice(0, 10);

	return `remuneracoes-${now}.${format === "pdf" ? "pdf" : "csv"}`;
}
