import { formatter } from "@/shared/lib/formatter";
import type { Remuneration } from "../schemas/model";

function escapeCsvValue(value: string) {
	return `"${value.replaceAll(`"`, `""`)}"`;
}

function escapePdfText(value: string) {
	return value
		.replaceAll("\\", "\\\\")
		.replaceAll("(", "\\(")
		.replaceAll(")", "\\)");
}

function toExportRows(remunerations: Remuneration[]) {
	return remunerations.map((remuneration) => ({
		employee: remuneration.employeeName,
		contract: remuneration.contractProcessNumber,
		paymentDate: formatter.date(remuneration.paymentDate),
		amount: formatter.currency(remuneration.amount),
		effectivePercentage: formatter.percent(remuneration.effectivePercentage),
		overrideState: remuneration.isManualOverride ? "Manual" : "Automática",
		activeState: remuneration.isSoftDeleted
			? "Excluída"
			: remuneration.isActive
				? "Ativa"
				: "Inativa",
		createdAt: formatter.date(remuneration.createdAt),
	}));
}

export function buildRemunerationSpreadsheet(remunerations: Remuneration[]) {
	const rows = toExportRows(remunerations);
	const header = [
		"Colaborador",
		"Contrato",
		"Pagamento",
		"Valor",
		"Percentual efetivo",
		"Origem",
		"Situação",
		"Criado em",
	];
	const body = rows.map((row) => [
		row.employee,
		row.contract,
		row.paymentDate,
		row.amount,
		row.effectivePercentage,
		row.overrideState,
		row.activeState,
		row.createdAt,
	]);

	return [header, ...body]
		.map((line) => line.map(escapeCsvValue).join(","))
		.join("\n");
}

function chunkLines(lines: string[], size: number) {
	const chunks: string[][] = [];

	for (let index = 0; index < lines.length; index += size) {
		chunks.push(lines.slice(index, index + size));
	}

	return chunks;
}

export function buildRemunerationPdf(remunerations: Remuneration[]) {
	const lines = [
		"Relatório de remunerações",
		"",
		...toExportRows(remunerations).flatMap((row) => [
			`${row.employee} | ${row.contract}`,
			`Pagamento: ${row.paymentDate} | Valor: ${row.amount} | Percentual: ${row.effectivePercentage}`,
			`Origem: ${row.overrideState} | Situação: ${row.activeState} | Criado em: ${row.createdAt}`,
			"",
		]),
	];

	const pages = chunkLines(lines, 32);
	const objects: string[] = [];
	const pageIds: number[] = [];
	const contentIds: number[] = [];
	const fontId = 3;

	for (let index = 0; index < pages.length; index += 1) {
		pageIds.push(4 + index * 2);
		contentIds.push(5 + index * 2);
	}

	objects[0] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
	objects[1] = `2 0 obj\n<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>\nendobj\n`;
	objects[2] =
		"3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

	for (let index = 0; index < pages.length; index += 1) {
		const pageId = pageIds[index];
		const contentId = contentIds[index];
		const pageLines = pages[index] ?? [];
		const content = [
			"BT",
			"/F1 10 Tf",
			"40 800 Td",
			"14 TL",
			...pageLines.map((line, lineIndex) =>
				lineIndex === 0
					? `(${escapePdfText(line)}) Tj`
					: `T* (${escapePdfText(line)}) Tj`,
			),
			"ET",
		].join("\n");
		const length = Buffer.byteLength(content, "utf8");

		objects[pageId - 1] =
			`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`;
		objects[contentId - 1] =
			`${contentId} 0 obj\n<< /Length ${length} >>\nstream\n${content}\nendstream\nendobj\n`;
	}

	let pdf = "%PDF-1.4\n";
	const offsets = [0];

	for (const object of objects) {
		offsets.push(Buffer.byteLength(pdf, "utf8"));
		pdf += object;
	}

	const xrefOffset = Buffer.byteLength(pdf, "utf8");
	pdf += `xref\n0 ${objects.length + 1}\n`;
	pdf += "0000000000 65535 f \n";

	for (let index = 1; index < offsets.length; index += 1) {
		pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
	}

	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

	return Buffer.from(pdf, "utf8");
}

export function createRemunerationExportFileName(
	format: "pdf" | "spreadsheet",
) {
	const now = new Date().toISOString().slice(0, 10);

	return `remuneracoes-${now}.${format === "pdf" ? "pdf" : "csv"}`;
}
