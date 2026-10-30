import type { PrismaClient } from "../src/generated/prisma/client.js";
export async function verifyFinancialSeed(prisma: PrismaClient) {
	const counts = await prisma.$queryRaw<
		Array<{
			people: number;
			profiles: number;
			contracts: number;
			receivables: number;
			payables: number;
			receipts: number;
			payments: number;
			calculations: number;
		}>
	>`SELECT (SELECT count(*)::int FROM people) people,(SELECT count(*)::int FROM employee_profiles) profiles,(SELECT count(*)::int FROM contracts) contracts,(SELECT count(*)::int FROM receivables) receivables,(SELECT count(*)::int FROM payables) payables,(SELECT count(*)::int FROM receipts) receipts,(SELECT count(*)::int FROM payments) payments,(SELECT count(*)::int FROM remuneration_calculations) calculations`;
	const invalid = await prisma.$queryRaw<
		Array<{ issue: string; count: bigint }>
	>`
 SELECT 'overpaid_receivables' issue,count(*) FROM receivables t WHERE t.amount<(SELECT coalesce(sum(s."principalAbated"),0) FROM receipts s WHERE s."receivableId"=t.id AND NOT EXISTS(SELECT 1 FROM receipt_reversals r WHERE r."receiptId"=s.id))
 UNION ALL SELECT 'overpaid_payables',count(*) FROM payables t WHERE t.amount<(SELECT coalesce(sum(s."principalAbated"),0) FROM payments s WHERE s."payableId"=t.id AND NOT EXISTS(SELECT 1 FROM payment_reversals r WHERE r."paymentId"=s.id))
 UNION ALL SELECT 'orphan_calculations',count(*) FROM remuneration_calculations c LEFT JOIN payables p ON p."remunerationCalculationId"=c.id WHERE p.id IS NULL
 UNION ALL SELECT 'wrong_beneficiary',count(*) FROM payables p JOIN remuneration_calculations c ON c.id=p."remunerationCalculationId" JOIN contract_assignments a ON a.id=c."contractAssignmentId" JOIN employee_profiles e ON e.id=a."employeeProfileId" WHERE p."beneficiaryId"<>e."personId"
 UNION ALL SELECT 'future_cash',count(*) FROM (SELECT "effectiveDate" FROM receipts UNION ALL SELECT "effectiveDate" FROM payments UNION ALL SELECT "effectiveDate" FROM receipt_reversals UNION ALL SELECT "effectiveDate" FROM payment_reversals) s WHERE s."effectiveDate">(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date
 UNION ALL SELECT 'missing_remuneration',count(*) FROM receipts s JOIN receivables t ON t.id=s."receivableId" JOIN revenues r ON r.id=t."revenueId" JOIN contract_assignments a ON a."contractId"=r."contractId" WHERE s."generatesRemuneration" AND s."effectiveAmount">0 AND a."isActive" AND a."deletedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM remuneration_calculations c WHERE c."receiptId"=s.id AND c."contractAssignmentId"=a.id)
 `;
	for (const row of invalid) {
		if (Number(row.count) !== 0) {
			throw new Error(`Seed inválido: ${row.issue}=${row.count}`);
		}
	}
	const ten = await prisma.$queryRaw<
		Array<{ count: number; total: string }>
	>`SELECT count(*)::int count,sum(amount)::text total FROM payables WHERE notes='Dez advogados: seleção de R$ 5.000'`;
	if (ten[0].count !== 10 || ten[0].total !== "5000.00") {
		throw new Error("Cenário dez advogados inválido");
	}
	if (
		counts[0].people < 14 ||
		counts[0].profiles < 11 ||
		counts[0].receipts < 6
	) {
		throw new Error("Seed incompleto");
	}
	console.log(
		JSON.stringify({
			counts: counts[0],
			tenLawyers: ten[0],
			invariants: invalid.map((r) => ({
				issue: r.issue,
				count: Number(r.count),
			})),
		}),
	);
}

export async function seedFinancialAttachments(prisma: PrismaClient) {
	const { readFile } = await import("node:fs/promises");
	const base = process.env.SUPABASE_URL,
		bucket = process.env.SUPABASE_STORAGE_BUCKET,
		secret = process.env.SUPABASE_SECRET_KEY;
	if (!base || !bucket || !secret) {
		console.log(
			"Anexos: configure SUPABASE_URL, SUPABASE_STORAGE_BUCKET e SUPABASE_SECRET_KEY para fixtures reais.",
		);
		return;
	}
	const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
	const bucketUrl = `${base}/storage/v1/bucket/${encodeURIComponent(bucket)}`;
	let response = await fetch(bucketUrl, { headers });
	if (!response.ok) {
		const create = await fetch(`${base}/storage/v1/bucket`, {
			method: "POST",
			headers: { ...headers, "Content-Type": "application/json" },
			body: JSON.stringify({ id: bucket, name: bucket, public: false }),
		});
		if (!create.ok) {
			throw new Error(
				`Não foi possível preparar bucket privado: ${create.status}`,
			);
		}
		response = await fetch(bucketUrl, { headers });
	}
	if (!response.ok) {
		throw new Error("Bucket não disponível");
	}
	const metadata = (await response.json()) as { public: boolean };
	if (metadata.public) {
		throw new Error("Bucket deve ser privado");
	}
	const png = await readFile(
		new URL("./fixtures/documento-demonstrativo.png", import.meta.url),
	);
	const contract = await prisma.contract.findFirstOrThrow({
			where: { firmId: 1 },
		}),
		expense = await prisma.expense.findFirstOrThrow({ where: { firmId: 1 } }),
		receipt = await prisma.receipt.findFirstOrThrow({ where: { firmId: 1 } }),
		payment = await prisma.payment.findFirstOrThrow({ where: { firmId: 1 } });
	const type = await prisma.attachmentType.findUniqueOrThrow({
		where: { value: "PNG" },
	});
	const owners = [
		{ personId: 1 },
		{ contractId: contract.id },
		{ expenseId: expense.id },
		{ receiptId: receipt.id },
		{ paymentId: payment.id },
	];
	for (const [index, owner] of owners.entries()) {
		const path = `financial-seed/v1/owner-${index}.png`;
		const upload = await fetch(
			`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path}`,
			{
				method: "POST",
				headers: {
					...headers,
					"Content-Type": "image/png",
					"x-upsert": "true",
				},
				body: png,
			},
		);
		if (!upload.ok) {
			throw new Error(`Falha no upload demonstrativo: ${upload.status}`);
		}
		const read = await fetch(
			`${base}/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${path}`,
			{ headers },
		);
		if (
			!read.ok ||
			Buffer.compare(Buffer.from(await read.arrayBuffer()), png) !== 0
		) {
			throw new Error("Anexo gravado não corresponde ao fixture");
		}
		await prisma.attachment.upsert({
			where: { storagePath: path },
			update: {},
			create: {
				...owner,
				firmId: 1,
				typeId: type.id,
				fileName: `documento-demonstrativo-${index}.png`,
				storagePath: path,
				mimeType: "image/png",
				fileSize: png.length,
			},
		});
	}
	console.log("5 anexos privados enviados e bytes verificados.");
}
