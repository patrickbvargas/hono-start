import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client.js";

import { env } from "../src/shared/config/env.js";
import { seedPreviewEvidence } from "./seed-evidence.js";
import type {
	AssignmentTypeValue,
	AttachmentTypeValue,
	ContractSeedInput,
	ContractStatusValue,
	ExpenseCategoryValue,
	LegalAreaValue,
	RevenueTypeValue,
} from "./seed-fixtures.js";
import { createClientSeeds, createEmployeeSeeds } from "./seed-fixtures.js";
import {
	createContractSeeds,
	createExpenseSeeds,
	createPoaSeeds,
	getSeedReferenceDate,
} from "./seed-scenarios.js";

const adapter = new PrismaPg(
	{
		connectionString: env.DIRECT_URL,
	},
	{ schema: new URL(env.DIRECT_URL).searchParams.get("schema") ?? "public" },
);

const prisma = new PrismaClient({ adapter });
const DEFAULT_FIRM_ID = 1;
const POA_FIRM_ID = 2;

export interface EmployeeRecord {
	id: number;
	email: string;
	fullName: string;
	remunerationPercentage: Prisma.Decimal;
	referralPercentage: Prisma.Decimal;
}

export interface ClientRecord {
	id: number;
	document: string;
}

export interface LookupRecord<TValue extends string> {
	id: number;
	value: TValue;
}

export interface CreatedContractAssignment {
	id: number;
	assignmentTypeValue: AssignmentTypeValue;
	employee: {
		remunerationPercentage: Prisma.Decimal;
		referralPercentage: Prisma.Decimal;
	};
}

function decimal(value: Prisma.Decimal | string | number) {
	return new Prisma.Decimal(value);
}
function mapByKey<TKey, TValue>(
	items: TValue[],
	getKey: (item: TValue) => TKey,
) {
	return new Map(items.map((item) => [getKey(item), item]));
}

function getRequiredMapValue<TKey, TValue>(
	map: Map<TKey, TValue>,
	key: TKey,
	label: string,
) {
	const item = map.get(key);

	if (!item) {
		throw new Error(`Missing required seed reference for ${label}`);
	}

	return item;
}

function getRecommendingReferralPercentage(
	assignments: CreatedContractAssignment[],
) {
	return assignments
		.filter((assignment) => assignment.assignmentTypeValue === "RECOMMENDING")
		.reduce(
			(highest, assignment) =>
				Prisma.Decimal.max(highest, assignment.employee.referralPercentage),
			decimal(0),
		);
}

function getAssignmentEffectivePercentage(
	assignment: CreatedContractAssignment,
	recommendingReferralPercentage: Prisma.Decimal,
) {
	switch (assignment.assignmentTypeValue) {
		case "RESPONSIBLE":
		case "ADMIN_ASSISTANT":
			return assignment.employee.remunerationPercentage;
		case "RECOMMENDING":
			return assignment.employee.referralPercentage;
		case "RECOMMENDED":
			return assignment.employee.remunerationPercentage.minus(
				recommendingReferralPercentage,
			);
		default:
			return decimal(0);
	}
}

async function createFeeRemunerations(params: {
	tx: Prisma.TransactionClient;
	firmId: number;
	feeId: number;
	amount: Prisma.Decimal;
	paymentDate: Date;
	assignments: CreatedContractAssignment[];
	isActive: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	manualAdjustment?: boolean;
}) {
	const recommendingReferralPercentage = getRecommendingReferralPercentage(
		params.assignments,
	);
	const remunerations = params.assignments.map((assignment) => {
		let effectivePercentage = getAssignmentEffectivePercentage(
			assignment,
			recommendingReferralPercentage,
		);

		if (params.manualAdjustment) {
			effectivePercentage = effectivePercentage.mul("0.9").toDecimalPlaces(4);
		}
		return {
			deletedAt: params.deletedAt,
			createdAt: params.createdAt,
			firmId: params.firmId,
			feeId: params.feeId,
			contractEmployeeId: assignment.id,
			effectivePercentage,
			amount: params.amount.mul(effectivePercentage),
			paymentDate: params.paymentDate,
			isSystemGenerated: !params.manualAdjustment,
			isActive: params.isActive,
		};
	});

	for (const data of remunerations) {
		const existing = await params.tx.remuneration.findFirst({
			where: { feeId: data.feeId, contractEmployeeId: data.contractEmployeeId },
			select: { id: true },
		});
		if (existing) {
			await params.tx.remuneration.update({ where: { id: existing.id }, data });
		} else {
			await params.tx.remuneration.create({ data });
		}
	}
}

async function reconcileContractFinancialFixture(params: {
	tx: Prisma.TransactionClient;
	firmId: number;
	contractSeed: ContractSeedInput;
	clientByDocument: Map<string, ClientRecord>;
	employeeByEmail: Map<string, EmployeeRecord>;
	legalAreaByValue: Map<LegalAreaValue, LookupRecord<LegalAreaValue>>;
	statusByValue: Map<ContractStatusValue, LookupRecord<ContractStatusValue>>;
	assignmentTypeByValue: Map<
		AssignmentTypeValue,
		LookupRecord<AssignmentTypeValue>
	>;
	revenueTypeByValue: Map<RevenueTypeValue, LookupRecord<RevenueTypeValue>>;
}) {
	const client = getRequiredMapValue(
		params.clientByDocument,
		params.contractSeed.clientDocument,
		`client ${params.contractSeed.clientDocument}`,
	);
	const legalArea = getRequiredMapValue(
		params.legalAreaByValue,
		params.contractSeed.legalAreaValue,
		`legal area ${params.contractSeed.legalAreaValue}`,
	);
	const status = getRequiredMapValue(
		params.statusByValue,
		params.contractSeed.statusValue,
		`contract status ${params.contractSeed.statusValue}`,
	);

	const contract = await params.tx.contract.upsert({
		where: {
			firmId_processNumber: {
				firmId: params.firmId,
				processNumber: params.contractSeed.processNumber,
			},
		},
		update: {
			clientId: client.id,
			legalAreaId: legalArea.id,
			statusId: status.id,
			feePercentage: params.contractSeed.feePercentage,
			notes: params.contractSeed.notes,
			allowStatusChange: params.contractSeed.allowStatusChange,
			isActive: params.contractSeed.isActive,
			deletedAt: params.contractSeed.deletedAt
				? new Date(params.contractSeed.deletedAt)
				: null,
			createdAt: new Date(params.contractSeed.createdAt),
		},
		create: {
			deletedAt: params.contractSeed.deletedAt
				? new Date(params.contractSeed.deletedAt)
				: null,
			createdAt: new Date(params.contractSeed.createdAt),
			firmId: params.firmId,
			clientId: client.id,
			legalAreaId: legalArea.id,
			statusId: status.id,
			processNumber: params.contractSeed.processNumber,
			feePercentage: params.contractSeed.feePercentage,
			notes: params.contractSeed.notes,
			allowStatusChange: params.contractSeed.allowStatusChange,
			isActive: params.contractSeed.isActive,
		},
		select: { id: true },
	});

	const createdAssignments: CreatedContractAssignment[] = [];

	for (const assignmentSeed of params.contractSeed.assignments) {
		const employee = getRequiredMapValue(
			params.employeeByEmail,
			assignmentSeed.employeeEmail,
			`employee ${assignmentSeed.employeeEmail}`,
		);
		const assignmentType = getRequiredMapValue(
			params.assignmentTypeByValue,
			assignmentSeed.assignmentTypeValue,
			`assignment type ${assignmentSeed.assignmentTypeValue}`,
		);
		const assignmentData = {
			firmId: params.firmId,
			contractId: contract.id,
			employeeId: employee.id,
			assignmentTypeId: assignmentType.id,
			isActive: assignmentSeed.isActive ?? true,
			deletedAt: params.contractSeed.deletedAt
				? new Date(params.contractSeed.deletedAt)
				: null,
			createdAt: new Date(params.contractSeed.createdAt),
		};
		const existingAssignment = await params.tx.contractEmployee.findFirst({
			where: {
				contractId: contract.id,
				employeeId: employee.id,
				assignmentTypeId: assignmentType.id,
			},
			select: { id: true },
		});
		const assignment = existingAssignment
			? await params.tx.contractEmployee.update({
					where: { id: existingAssignment.id },
					data: assignmentData,
					select: { id: true },
				})
			: await params.tx.contractEmployee.create({
					data: assignmentData,
					select: { id: true },
				});

		if (assignmentSeed.isActive === false) {
			continue;
		}
		createdAssignments.push({
			id: assignment.id,
			assignmentTypeValue: assignmentSeed.assignmentTypeValue,
			employee: {
				remunerationPercentage: employee.remunerationPercentage,
				referralPercentage: employee.referralPercentage,
			},
		});
	}

	for (const revenueSeed of params.contractSeed.revenues) {
		const revenueType = getRequiredMapValue(
			params.revenueTypeByValue,
			revenueSeed.typeValue,
			`revenue type ${revenueSeed.typeValue}`,
		);
		const deletedAt = params.contractSeed.deletedAt ?? revenueSeed.deletedAt;
		const revenueData = {
			firmId: params.firmId,
			contractId: contract.id,
			typeId: revenueType.id,
			totalValue: revenueSeed.totalValue,
			downPaymentValue: revenueSeed.downPaymentValue,
			paymentStartDate: new Date(revenueSeed.paymentStartDate),
			totalInstallments: revenueSeed.totalInstallments,
			isActive: revenueSeed.isActive,
			deletedAt: deletedAt ? new Date(deletedAt) : null,
			createdAt: new Date(
				revenueSeed.createdAt ?? params.contractSeed.createdAt,
			),
		};
		const existingRevenue = await params.tx.revenue.findFirst({
			where: { contractId: contract.id, typeId: revenueType.id },
			select: { id: true },
		});
		const revenue = existingRevenue
			? await params.tx.revenue.update({
					where: { id: existingRevenue.id },
					data: revenueData,
					select: { id: true },
				})
			: await params.tx.revenue.create({
					data: revenueData,
					select: { id: true },
				});

		for (const feeSeed of revenueSeed.fees) {
			const feeDeletedAt = feeSeed.deletedAt ?? deletedAt;
			const feeCreatedAt = new Date(feeSeed.createdAt ?? feeSeed.paymentDate);
			const feeData = {
				firmId: params.firmId,
				revenueId: revenue.id,
				paymentDate: new Date(feeSeed.paymentDate),
				amount: feeSeed.amount,
				installmentNumber: feeSeed.installmentNumber,
				generatesRemuneration: feeSeed.generatesRemuneration,
				isActive: feeSeed.isActive,
				deletedAt: feeDeletedAt ? new Date(feeDeletedAt) : null,
				createdAt: feeCreatedAt,
			};
			const existingFee = await params.tx.fee.findFirst({
				where: {
					revenueId: revenue.id,
					installmentNumber: feeSeed.installmentNumber,
				},
				select: { id: true },
			});
			const fee = existingFee
				? await params.tx.fee.update({
						where: { id: existingFee.id },
						data: feeData,
						select: { id: true },
					})
				: await params.tx.fee.create({ data: feeData, select: { id: true } });

			if (feeSeed.generatesRemuneration) {
				await createFeeRemunerations({
					tx: params.tx,
					firmId: params.firmId,
					feeId: fee.id,
					amount: decimal(feeSeed.amount),
					paymentDate: new Date(feeSeed.paymentDate),
					assignments: createdAssignments,
					isActive: feeSeed.isActive,
					deletedAt: feeDeletedAt ? new Date(feeDeletedAt) : null,
					createdAt: feeCreatedAt,
					manualAdjustment: feeSeed.manualAdjustment,
				});
			}
		}
	}
}

async function main() {
	const reference = getSeedReferenceDate(process.env.SEED_REFERENCE_DATE);
	if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_R2_BUCKET_NAME || !env.CLOUDFLARE_R2_ACCESS_KEY_ID || !env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
		throw new Error(
			"Configure CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_ACCESS_KEY_ID e CLOUDFLARE_R2_SECRET_ACCESS_KEY para criar os anexos demonstrativos.",
		);
	}
	console.log(
		`🌱 Dados demonstrativos até ${reference.toISOString().slice(0, 10)}`,
	);

	await Promise.all(
		[
			{
				value: "LAWYER",
				label: "Advogado",
			},
			{
				value: "ADMIN_ASSISTANT",
				label: "Assistente Administrativo",
			},
		].map((item) =>
			prisma.employeeType.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "ADMIN", label: "Administrador" },
			{ value: "USER", label: "Usuário" },
		].map((item) =>
			prisma.userRole.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "INDIVIDUAL", label: "Pessoa Física" },
			{ value: "COMPANY", label: "Pessoa Jurídica" },
		].map((item) =>
			prisma.clientType.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "SOCIAL_SECURITY", label: "Previdenciário" },
			{ value: "CIVIL", label: "Cível" },
			{ value: "FAMILY", label: "Família" },
			{ value: "LABOR", label: "Trabalhista" },
			{ value: "OTHER", label: "Outros" },
		].map((item) =>
			prisma.legalArea.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "ACTIVE", label: "Ativo" },
			{ value: "COMPLETED", label: "Concluído" },
			{ value: "CANCELLED", label: "Cancelado" },
		].map((item) =>
			prisma.contractStatus.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "RESPONSIBLE", label: "Responsável" },
			{ value: "RECOMMENDING", label: "Indicante" },
			{ value: "RECOMMENDED", label: "Indicado" },
			{ value: "ADMIN_ASSISTANT", label: "Assistente Administrativo" },
		].map((item) =>
			prisma.assignmentType.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "ADMINISTRATIVE", label: "Administrativo" },
			{ value: "JUDICIAL", label: "Judicial" },
			{ value: "SUCCUMBENCY", label: "Sucumbência" },
		].map((item) =>
			prisma.revenueType.upsert({
				where: { value: item.value },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "PDF", label: "PDF" },
			{ value: "JPG", label: "JPG" },
			{ value: "PNG", label: "PNG" },
		].map((item) =>
			prisma.attachmentType.upsert({
				where: { value: item.value as AttachmentTypeValue },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await Promise.all(
		[
			{ value: "PAYROLL_LAWYERS", label: "Folha Advogados" },
			{ value: "PAYROLL_INTERNS", label: "Folha Estagiários" },
			{ value: "PAYROLL_STAFF", label: "Folha Funcionários" },
			{ value: "TAX_PIS", label: "PIS" },
			{ value: "TAX_IRPJ", label: "IRPJ" },
			{ value: "TAX_COFINS", label: "COFINS" },
			{ value: "TAX_ISSQN", label: "ISSQN" },
			{ value: "TAX_CSLL", label: "CSLL" },
			{ value: "TAX_OTHER", label: "Outros Impostos" },
			{ value: "PHONE", label: "Telefone" },
			{ value: "MEDIA", label: "Mídia" },
			{ value: "POSTAGE", label: "Correio" },
			{ value: "CONDOMINIUM", label: "Condomínio" },
			{ value: "ELECTRICITY", label: "RGE" },
			{ value: "MEALS", label: "Refeitório" },
			{ value: "ASSETS", label: "Patrimônio" },
			{ value: "SUPPLIES", label: "Insumos" },
			{ value: "NOTARY", label: "Tabelionato" },
			{ value: "COURT_COSTS", label: "Custos Judiciais" },
			{ value: "OTHER", label: "Outros" },
		].map((item) =>
			prisma.expenseCategory.upsert({
				where: { value: item.value as ExpenseCategoryValue },
				update: { label: item.label, isActive: true },
				create: { ...item, isActive: true },
			}),
		),
	);

	await prisma.firm.upsert({
		where: { id: DEFAULT_FIRM_ID },
		update: {},
		create: { id: DEFAULT_FIRM_ID, name: "Matriz" },
	});

	await prisma.firm.upsert({
		where: { id: POA_FIRM_ID },
		update: { name: "POA" },
		create: { id: POA_FIRM_ID, name: "POA" },
	});

	const employeeSeeds = createEmployeeSeeds();
	const clientSeeds = createClientSeeds();
	const masterCreatedAt = new Date(
		Date.UTC(reference.getUTCFullYear() - 3, 0, 1, 12),
	);
	employeeSeeds[employeeSeeds.length - 1].deletedAt = reference.toISOString();
	clientSeeds[clientSeeds.length - 1].deletedAt = reference.toISOString();

	const [lawyerType, assistantType, , , individualType, companyType] =
		await Promise.all([
			prisma.employeeType.findUniqueOrThrow({ where: { value: "LAWYER" } }),
			prisma.employeeType.findUniqueOrThrow({
				where: { value: "ADMIN_ASSISTANT" },
			}),
			prisma.userRole.findUniqueOrThrow({ where: { value: "ADMIN" } }),
			prisma.userRole.findUniqueOrThrow({ where: { value: "USER" } }),
			prisma.clientType.findUniqueOrThrow({ where: { value: "INDIVIDUAL" } }),
			prisma.clientType.findUniqueOrThrow({ where: { value: "COMPANY" } }),
		]);

	for (const employee of employeeSeeds) {
		const existingEmployee = await prisma.employee.findFirst({
			where: {
				OR: [
					{ fullName: employee.fullName },
					...(employee.oabNumber ? [{ oabNumber: employee.oabNumber }] : []),
				],
			},
			select: {
				id: true,
			},
		});

		const employeeData = {
			fullName: employee.fullName,
			typeId:
				employee.typeValue === "LAWYER" ? lawyerType.id : assistantType.id,
			oabNumber: employee.oabNumber ?? null,
			remunerationPercentage: employee.remunerationPercentage,
			referralPercentage: employee.referralPercentage,
			isActive: employee.isActive,
			deletedAt: employee.deletedAt ? new Date(employee.deletedAt) : null,
			createdAt: masterCreatedAt,
		};

		if (existingEmployee) {
			await prisma.employee.update({
				where: {
					id: existingEmployee.id,
				},
				data: employeeData,
			});
			continue;
		}

		await prisma.employee.create({
			data: employeeData,
		});
	}

	await Promise.all(
		clientSeeds.map((client) =>
			prisma.client.upsert({
				where: {
					document: client.document,
				},
				update: {
					typeId:
						client.typeValue === "INDIVIDUAL"
							? individualType.id
							: companyType.id,
					fullName: client.fullName,
					email: client.email,
					phone: client.phone,
					isActive: client.isActive,
					deletedAt: client.deletedAt ? new Date(client.deletedAt) : null,
					createdAt: masterCreatedAt,
				},
				create: {
					typeId:
						client.typeValue === "INDIVIDUAL"
							? individualType.id
							: companyType.id,
					fullName: client.fullName,
					document: client.document,
					deletedAt: client.deletedAt ? new Date(client.deletedAt) : null,
					createdAt: masterCreatedAt,
					email: client.email,
					phone: client.phone,
					isActive: client.isActive,
				},
			}),
		),
	);

	const [
		employeeRecords,
		clientRecords,
		legalAreas,
		statuses,
		assignmentTypes,
		revenueTypes,
		expenseCategories,
	] = await Promise.all([
		prisma.employee.findMany({
			select: {
				id: true,
				fullName: true,
				remunerationPercentage: true,
				referralPercentage: true,
			},
		}),
		prisma.client.findMany({
			select: {
				id: true,
				document: true,
			},
		}),
		prisma.legalArea.findMany({
			select: {
				id: true,
				value: true,
			},
		}),
		prisma.contractStatus.findMany({
			select: {
				id: true,
				value: true,
			},
		}),
		prisma.assignmentType.findMany({
			select: {
				id: true,
				value: true,
			},
		}),
		prisma.revenueType.findMany({
			select: {
				id: true,
				value: true,
			},
		}),
		prisma.expenseCategory.findMany({
			select: {
				id: true,
				value: true,
			},
		}),
	]);

	const matrizContracts = createContractSeeds(
		clientSeeds,
		employeeSeeds,
		reference,
	);
	const matrizExpenses = createExpenseSeeds(reference);
	const employeeByEmail = mapByKey(
		employeeRecords.map((employee) => ({
			...employee,
			email:
				employeeSeeds.find((seed) => seed.fullName === employee.fullName)
					?.email ?? "",
		})) as EmployeeRecord[],
		(employee) => employee.email,
	);
	const clientByDocument = mapByKey(
		clientRecords as ClientRecord[],
		(client) => client.document,
	);
	const legalAreaByValue = mapByKey(
		legalAreas as LookupRecord<LegalAreaValue>[],
		(item) => item.value,
	);
	const statusByValue = mapByKey(
		statuses as LookupRecord<ContractStatusValue>[],
		(item) => item.value,
	);
	const assignmentTypeByValue = mapByKey(
		assignmentTypes as LookupRecord<AssignmentTypeValue>[],
		(item) => item.value,
	);
	const revenueTypeByValue = mapByKey(
		revenueTypes as LookupRecord<RevenueTypeValue>[],
		(item) => item.value,
	);
	const expenseCategoryByValue = mapByKey(
		expenseCategories as LookupRecord<ExpenseCategoryValue>[],
		(item) => item.value,
	);

	const poa = createPoaSeeds(matrizContracts, matrizExpenses);
	for (const { firmId, contracts: contractSeeds, expenses: expenseSeeds } of [
		{
			firmId: DEFAULT_FIRM_ID,
			contracts: matrizContracts,
			expenses: matrizExpenses,
		},
		{ firmId: POA_FIRM_ID, ...poa },
	]) {
		for (let offset = 0; offset < contractSeeds.length; offset += 6) {
			await Promise.all(
				contractSeeds.slice(offset, offset + 6).map((contractSeed) =>
					prisma.$transaction(
						async (tx) => {
							await reconcileContractFinancialFixture({
								tx,
								firmId,
								contractSeed,
								clientByDocument,
								employeeByEmail,
								legalAreaByValue,
								statusByValue,
								assignmentTypeByValue,
								revenueTypeByValue,
							});
						},
						{ timeout: 30000 },
					),
				),
			);
		}

		for (let offset = 0; offset < expenseSeeds.length; offset += 10) {
			await Promise.all(
				expenseSeeds.slice(offset, offset + 10).map(async (expenseSeed) => {
					const category = getRequiredMapValue(
						expenseCategoryByValue,
						expenseSeed.categoryValue,
						`expense category ${expenseSeed.categoryValue}`,
					);

					const data = {
						firmId,
						categoryId: category.id,
						expenseDate: new Date(expenseSeed.expenseDate),
						amount: expenseSeed.amount,
						notes: expenseSeed.notes,
						isActive: expenseSeed.isActive,
						deletedAt: expenseSeed.deletedAt
							? new Date(expenseSeed.deletedAt)
							: null,
						createdAt: new Date(expenseSeed.createdAt),
					};
					const existing = await prisma.expense.findFirst({
						where: { firmId, notes: expenseSeed.notes },
						select: { id: true },
					});
					if (existing) {
						await prisma.expense.update({ where: { id: existing.id }, data });
					} else {
						await prisma.expense.create({ data });
					}
				}),
			);
		}
		await seedPreviewEvidence(prisma, firmId, reference, {
			clientDocuments:
				firmId === DEFAULT_FIRM_ID
					? clientSeeds.map((row) => row.document)
					: [],
			employeeNames:
				firmId === DEFAULT_FIRM_ID
					? employeeSeeds.map((row) => row.fullName)
					: [],
			processNumbers: contractSeeds.map((row) => row.processNumber),
			expenseNotes: expenseSeeds.flatMap((row) =>
				row.notes ? [row.notes] : [],
			),
		});
		console.log(
			`Demo unidade ${firmId}: ${contractSeeds.length} contratos, ${expenseSeeds.length} despesas. Identidades Clerk configuradas separadamente.`,
		);
	}

	// Clerk identities are provisioned separately after an explicit migration mapping.
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
