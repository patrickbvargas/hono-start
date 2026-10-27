import { readFile } from "node:fs/promises";
import type { Prisma, PrismaClient } from "../src/generated/prisma/client.js";
import {
	readAttachmentFile,
	uploadAttachmentFile,
} from "../src/shared/lib/attachment-storage.js";

export async function seedPreviewEvidence(
	prisma: PrismaClient,
	firmId: number,
	reference: Date,
	keys: {
		clientDocuments: string[];
		employeeNames: string[];
		processNumbers: string[];
		expenseNotes: string[];
	},
) {
	await prisma.auditLog.updateMany({
		where: {
			firmId,
			actorName: "Patrícia Vargas",
			OR: [
				{ description: { startsWith: "Cadastro demonstrativo:" } },
				{ description: { startsWith: "Exclusão demonstrativa:" } },
				{ description: { startsWith: "Ajuste demonstrativo de remuneração:" } },
			],
		},
		data: { actorName: "Patrick Vargas" },
	});

	interface EvidenceRow {
		id: number;
		createdAt: Date;
		deletedAt: Date | null;
		fullName?: string;
		processNumber?: string;
		notes?: string | null;
		amount?: Prisma.Decimal;
		effectivePercentage?: Prisma.Decimal;
		isSystemGenerated?: boolean;
	}
	const records: {
		entityType: string;
		owner:
			| "clientId"
			| "employeeId"
			| "contractId"
			| "feeId"
			| "expenseId"
			| "remunerationId";
		rows: EvidenceRow[];
	}[] = [
		{
			entityType: "Client",
			owner: "clientId",
			rows: await prisma.client.findMany({
				where: { document: { in: keys.clientDocuments } },
				select: { id: true, fullName: true, createdAt: true, deletedAt: true },
			}),
		},
		{
			entityType: "Employee",
			owner: "employeeId",
			rows: await prisma.employee.findMany({
				where: { fullName: { in: keys.employeeNames } },
				select: { id: true, fullName: true, createdAt: true, deletedAt: true },
			}),
		},
		{
			entityType: "Contract",
			owner: "contractId",
			rows: await prisma.contract.findMany({
				where: { firmId, processNumber: { in: keys.processNumbers } },
				select: {
					id: true,
					processNumber: true,
					createdAt: true,
					deletedAt: true,
				},
			}),
		},
		{
			entityType: "Fee",
			owner: "feeId",
			rows: await prisma.fee.findMany({
				where: {
					firmId,
					revenue: { contract: { processNumber: { in: keys.processNumbers } } },
				},
				select: { id: true, amount: true, createdAt: true, deletedAt: true },
			}),
		},
		{
			entityType: "Expense",
			owner: "expenseId",
			rows: await prisma.expense.findMany({
				where: { firmId, notes: { in: keys.expenseNotes } },
				select: { id: true, notes: true, createdAt: true, deletedAt: true },
			}),
		},
		{
			entityType: "Remuneration",
			owner: "remunerationId",
			rows: await prisma.remuneration.findMany({
				where: {
					firmId,
					fee: {
						revenue: {
							contract: { processNumber: { in: keys.processNumbers } },
						},
					},
				},
				select: {
					id: true,
					amount: true,
					isSystemGenerated: true,
					effectivePercentage: true,
					createdAt: true,
					deletedAt: true,
				},
			}),
		},
	];
	const type = await prisma.attachmentType.findUniqueOrThrow({
		where: { value: "PNG" },
	});
	const bytes = await readFile(
		new URL("./fixtures/documento-demonstrativo.png", import.meta.url),
	);
	const existingDescriptions = new Set(
		(
			await prisma.auditLog.findMany({
				where: { firmId },
				select: { description: true },
			})
		).map((row) => row.description),
	);
	const events: Prisma.AuditLogCreateManyInput[] = [];
	for (const group of records) {
		for (const row of group.rows) {
			const entityName =
				row.fullName ??
				row.processNumber ??
				row.notes ??
				(row.amount ? `R$ ${row.amount.toFixed(2)}` : `Registro ${row.id}`);
			const base = {
				firmId,
				entityType: group.entityType,
				clientId: group.entityType === "Client" ? row.id : undefined,
				employeeId: group.entityType === "Employee" ? row.id : undefined,
				entityId: String(row.id),
			};
			const createDescription = `Cadastro demonstrativo: ${group.entityType} ${row.id} — ${entityName}.`;
			if (!existingDescriptions.has(createDescription)) {
				events.push({
					...base,
					actorName: "Patrick Vargas",
					actorEmail: "demo@example.com",
					action: "CREATE",
					entityName,
					changeData: {
						after: {
							id: row.id,
							fullName: row.fullName ?? null,
							processNumber: row.processNumber ?? null,
							amount: row.amount?.toFixed(2) ?? null,
							notes: row.notes ?? null,
							deletedAt: null,
							createdAt: row.createdAt.toISOString(),
						},
					},
					description: createDescription,
					createdAt: row.createdAt,
				});
			}
			if (row.deletedAt) {
				const description = `Exclusão demonstrativa: ${group.entityType} ${row.id} — ${entityName}.`;
				if (!existingDescriptions.has(description)) {
					events.push({
						...base,
						actorName: "Patrick Vargas",
						action: "DELETE",
						entityName,
						changeData: {
							before: { deletedAt: null },
							after: { deletedAt: row.deletedAt.toISOString() },
						},
						description,
						createdAt: row.deletedAt,
					});
				}
			}
			if (
				row.isSystemGenerated === false &&
				row.effectivePercentage &&
				row.amount
			) {
				const description = `Ajuste demonstrativo de remuneração: ${row.id}.`;
				if (!existingDescriptions.has(description)) {
					events.push({
						...base,
						actorName: "Patrick Vargas",
						action: "UPDATE",
						entityName,
						changeData: {
							before: {
								isSystemGenerated: true,
								effectivePercentage: row.effectivePercentage
									.div("0.9")
									.toFixed(4),
							},
							after: {
								isSystemGenerated: false,
								effectivePercentage: row.effectivePercentage.toFixed(4),
								amount: row.amount.toFixed(2),
							},
						},
						description,
						createdAt: row.createdAt,
					});
				}
			}
		}
		// Three readable evidence examples per owner, keeping every detail surface demonstrable.
		for (const row of group.rows
			.filter((row) => !row.deletedAt)
			.sort((a, b) => a.id - b.id)
			.slice(0, 3)) {
			const storagePath = `firms/${firmId}/demo/${group.entityType.toLowerCase()}/${row.id}/documento-demonstrativo.png`;
			try {
				await readAttachmentFile({ path: storagePath });
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
					throw error;
				}
				await uploadAttachmentFile({
					path: storagePath,
					contentType: "image/png",
					data: bytes,
				});
			}
			const data: Prisma.AttachmentUncheckedCreateInput = {
				firmId,
				[group.owner]: row.id,
				typeId: type.id,
				fileName: "Documento demonstrativo.png",
				storagePath,
				mimeType: "image/png",
				fileSize: bytes.length,
				createdAt: reference,
			};
			const attachment = await prisma.attachment.upsert({
				where: { storagePath },
				update: {},
				create: data,
			});
			const description = `Anexo demonstrativo: Attachment ${attachment.id}.`;
			if (!existingDescriptions.has(description)) {
				events.push({
					firmId,
					clientId: group.owner === "clientId" ? row.id : undefined,
					employeeId: group.owner === "employeeId" ? row.id : undefined,
					entityType: "Attachment",
					entityId: String(attachment.id),
					entityName: attachment.fileName,
					actorName: "Patrick Vargas",
					action: "CREATE",
					changeData: {
						after: { fileName: attachment.fileName, [group.owner]: row.id },
					},
					description,
					createdAt: reference,
				});
			}
		}
	}
	if (events.length > 0) {
		await prisma.auditLog.createMany({ data: events });
	}
}
