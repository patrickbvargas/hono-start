import { Prisma } from "../src/generated/prisma/client.js";
import type {
	ClientSeedInput,
	ContractSeedInput,
	EmployeeSeedInput,
	ExpenseCategoryValue,
	ExpenseSeedInput,
	LegalAreaValue,
	RevenueTypeValue,
} from "./seed-fixtures.js";

export function getSeedReferenceDate(value?: string): Date {
	const iso =
		value ??
		new Intl.DateTimeFormat("en-CA", {
			timeZone: "America/Sao_Paulo",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date());
	const date = new Date(`${iso}T23:59:59.999Z`);
	if (
		!/^\d{4}-\d{2}-\d{2}$/.test(iso) ||
		!Number.isFinite(date.getTime()) ||
		date.toISOString().slice(0, 10) !== iso
	) {
		throw new Error(
			"SEED_REFERENCE_DATE deve ser uma data válida no formato YYYY-MM-DD.",
		);
	}
	return date;
}

export function seedDate(year: number, month: number, day: number): string {
	const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	return new Date(Date.UTC(year, month, Math.min(day, last), 12)).toISOString();
}

export function createProcessNumber(sequence: number, year: number) {
	const base = `${String(sequence).padStart(7, "0")}${year}8210001`;
	const check = String(98n - (BigInt(`${base}00`) % 97n)).padStart(2, "0");
	return `${base.slice(0, 7)}-${check}.${year}.8.21.0001`;
}

export function createContractSeeds(
	clients: ClientSeedInput[],
	employees: EmployeeSeedInput[],
	reference: Date,
): ContractSeedInput[] {
	clients = clients.filter((c) => c.isActive && !c.deletedAt);
	const lawyers = employees.filter(
		(e) => e.typeValue === "LAWYER" && e.isActive,
	);
	const assistants = employees.filter(
		(e) => e.typeValue === "ADMIN_ASSISTANT" && e.isActive && !e.deletedAt,
	);
	const areas: LegalAreaValue[] = [
		"SOCIAL_SECURITY",
		"CIVIL",
		"FAMILY",
		"LABOR",
		"OTHER",
	];
	const types: RevenueTypeValue[] = [
		"ADMINISTRATIVE",
		"JUDICIAL",
		"SUCCUMBENCY",
	];
	const subjects = [
		"Revisão de aposentadoria",
		"Cobrança contratual",
		"Inventário e partilha",
		"Verbas rescisórias",
		"Consultoria jurídica",
	];
	const contracts: ContractSeedInput[] = [];
	const currentYear = reference.getUTCFullYear();
	for (let year = currentYear - 2; year <= currentYear; year++) {
		const finalMonth = year === currentYear ? reference.getUTCMonth() : 11;
		for (let month = 0; month <= finalMonth; month++) {
			for (let index = 0; index < 6; index++) {
				const paidAt = seedDate(
					year,
					month,
					Math.min(5 + index * 3, reference.getUTCDate()),
				);
				const growth = ["0.88", "0.94", "1.00"][year - currentYear + 2];
				const amount = new Prisma.Decimal(
					1800 + index * 425 + ((month * 7 + index * 3) % 11) * 130,
				)
					.mul(growth)
					.toDecimalPlaces(2);
				const down =
					index % 2 === 0 ? amount.mul("0.5") : new Prisma.Decimal(0);
				const settled =
					year < currentYear ||
					month < reference.getUTCMonth() - 2 ||
					index === 4;
				const installments = settled ? 1 : 6;
				const assignments: ContractSeedInput["assignments"] = [
					{
						employeeEmail: lawyers[(month + index) % lawyers.length].email,
						assignmentTypeValue: "RESPONSIBLE",
					},
				];
				if (index === 1 || index === 5) {
					assignments.push(
						{
							employeeEmail:
								lawyers[(month + index + 1) % lawyers.length].email,
							assignmentTypeValue: "RECOMMENDING",
						},
						{
							employeeEmail:
								lawyers[(month + index + 2) % lawyers.length].email,
							assignmentTypeValue: "RECOMMENDED",
						},
					);
				}
				if (index % 2 === 0) {
					assignments.push({
						employeeEmail:
							assistants[(month + index) % assistants.length].email,
						assignmentTypeValue: "ADMIN_ASSISTANT",
					});
				}
				contracts.push({
					processNumber: createProcessNumber(
						(year - 2000) * 10000 + month * 10 + index + 1,
						year,
					),
					clientDocument:
						clients[(month * 6 + index) % clients.length].document,
					legalAreaValue: areas[index % 5],
					statusValue: settled ? "COMPLETED" : "ACTIVE",
					feePercentage: index % 2 ? "0.2500" : "0.3000",
					notes: `${subjects[index % 5]}. Honorários ${index === 4 ? "quitados após acordo" : "parcelados conforme instrumento contratual"}.`,
					allowStatusChange: true,
					isActive: true,
					assignments,
					createdAt: paidAt,
					revenues: [
						{
							typeValue: types[index % 3],
							totalValue: amount.mul(installments).add(down).toFixed(2),
							downPaymentValue: down.isZero() ? null : down.toFixed(2),
							paymentStartDate: paidAt,
							totalInstallments: installments,
							isActive: true,
							createdAt: paidAt,
							fees: [
								{
									amount: amount.toFixed(2),
									installmentNumber: 1,
									paymentDate: paidAt,
									generatesRemuneration: index !== 3,
									isActive: true,
									createdAt: paidAt,
									manualAdjustment: index === 2,
								},
							],
						},
					],
				});
			}
		}
	}
	const template = contracts.at(-6);
	if (!template) {
		throw new Error("Seed requer ao menos um mês de atividade.");
	}
	const labels = [
		"Parcelas em atraso",
		"Próxima parcela em até sete dias",
		"Início de cobrança futuro",
		"Cancelado por acordo entre as partes",
		"Contrato inativo",
		"Contrato excluído",
		"Quitado com conclusão bloqueada",
		"Receitas administrativa e judicial",
		"Recebimento excluído",
		"Sem responsável ativo",
		"Sem receita ativa",
	];
	for (const [index, label] of labels.entries()) {
		const item: ContractSeedInput = structuredClone(template);
		item.processNumber = createProcessNumber(9000000 + index, currentYear);
		item.notes = label;
		item.statusValue = "ACTIVE";
		item.revenues[0].totalInstallments = 6;
		item.createdAt = seedDate(currentYear, reference.getUTCMonth() - 3, 1);
		item.revenues[0].createdAt = item.createdAt;
		item.revenues[0].fees = [];
		item.revenues[0].downPaymentValue = null;
		item.revenues[0].totalValue = "12000.00";
		item.revenues[0].paymentStartDate = seedDate(
			currentYear,
			reference.getUTCMonth() - 2,
			5,
		);
		if (index === 1 || index === 2) {
			item.revenues[0].paymentStartDate = seedDate(
				currentYear,
				reference.getUTCMonth() + 1,
				5,
			);
			if (index === 1) {
				// Days 1–28 round-trip exactly through monthly schedules, including February.
				const dueMonth =
					reference.getUTCMonth() + (reference.getUTCDate() > 28 ? 1 : 0);
				const dueDay =
					reference.getUTCDate() > 28
						? 1
						: Math.min(reference.getUTCDate() + 3, 28);
				// Installment 1 is already paid; installment 2 must fall inside the next seven days.
				item.revenues[0].paymentStartDate = seedDate(
					currentYear,
					dueMonth - 2,
					dueDay,
				);
				item.revenues[0].fees = [
					{
						amount: "2000.00",
						installmentNumber: 1,
						paymentDate: seedDate(
							currentYear,
							reference.getUTCMonth(),
							Math.min(reference.getUTCDate(), 5),
						),
						generatesRemuneration: true,
						isActive: true,
					},
				];
			}
		}
		if (index === 3) {
			item.statusValue = "CANCELLED";
		}
		if (index === 4) {
			item.isActive = false;
		}
		if (index === 5) {
			item.deletedAt = reference.toISOString();
		}
		if (index === 6) {
			item.allowStatusChange = false;
			item.revenues[0].totalInstallments = 1;
			item.revenues[0].fees = [
				{
					amount: "12000.00",
					installmentNumber: 1,
					paymentDate: seedDate(currentYear, reference.getUTCMonth(), 1),
					generatesRemuneration: true,
					isActive: true,
				},
			];
		}
		if (index === 7) {
			item.revenues.push({
				...structuredClone(item.revenues[0]),
				typeValue: "JUDICIAL",
				totalValue: "24000.00",
			});
		}
		if (index === 8) {
			item.revenues[0].fees = [
				{
					amount: "2000.00",
					installmentNumber: 1,
					paymentDate: item.revenues[0].paymentStartDate,
					generatesRemuneration: true,
					isActive: true,
					deletedAt: reference.toISOString(),
				},
			];
		}
		if (index === 9) {
			item.assignments = item.assignments.map((a) => ({
				...a,
				isActive: false,
			}));
		}
		if (index === 10) {
			item.revenues[0].isActive = false;
		}
		contracts.push(item);
	}
	return contracts;
}

export function createExpenseSeeds(reference: Date): ExpenseSeedInput[] {
	const categories: [ExpenseCategoryValue, string, number][] = [
		["PAYROLL_STAFF", "Folha da equipe administrativa", 6200],
		["PAYROLL_LAWYERS", "Honorários de apoio jurídico", 4800],
		["CONDOMINIUM", "Condomínio da sede", 1450],
		["ELECTRICITY", "Energia elétrica", 380],
		["PHONE", "Telefonia e internet", 240],
		["COURT_COSTS", "Custas e diligências", 970],
		["NOTARY", "Certidões e autenticações", 180],
		["SUPPLIES", "Material de escritório", 320],
		["MEDIA", "Divulgação institucional", 850],
		["TAX_ISSQN", "ISS sobre serviços", 1300],
	];
	const result: ExpenseSeedInput[] = [];
	for (
		let year = reference.getUTCFullYear() - 2;
		year <= reference.getUTCFullYear();
		year++
	) {
		const finalMonth =
			year === reference.getUTCFullYear() ? reference.getUTCMonth() : 11;
		for (let month = 0; month <= finalMonth; month++) {
			for (const [
				index,
				[categoryValue, label, base],
			] of categories.entries()) {
				const expenseDate = seedDate(
					year,
					month,
					Math.min(3 + index * 2, reference.getUTCDate()),
				);
				const annual =
					year === reference.getUTCFullYear()
						? "1.00"
						: year === reference.getUTCFullYear() - 1
							? "0.96"
							: "0.91";
				result.push({
					categoryValue,
					expenseDate,
					amount: new Prisma.Decimal(base)
						.mul(annual)
						.mul(
							new Prisma.Decimal(1).add(
								new Prisma.Decimal((month + index) % 5).div(100),
							),
						)
						.toFixed(2),
					notes: `${label} — ${String(month + 1).padStart(2, "0")}/${year}`,
					isActive: true,
					createdAt: expenseDate,
				});
			}
		}
	}
	result.push({
		...result[result.length - 1],
		notes: "Lançamento cancelado por duplicidade",
		deletedAt: reference.toISOString(),
	});
	result.push({
		...result[result.length - 2],
		notes: "Despesa inativa para conferência",
		isActive: false,
	});
	return result;
}

// A smaller independent operation over the same global clients and employees.
export function createPoaSeeds(
	contracts: ContractSeedInput[],
	expenses: ExpenseSeedInput[],
) {
	const scale = (value: string) =>
		new Prisma.Decimal(value).mul("0.6").toFixed(2);
	return {
		contracts: contracts.slice(-17).map((contract) => ({
			...contract,
			notes: `POA — ${contract.notes}`,
			assignments: contract.assignments.map((assignment) => ({
				...assignment,
			})),
			revenues: contract.revenues.map((revenue) => ({
				...revenue,
				totalValue: scale(revenue.totalValue),
				downPaymentValue:
					revenue.downPaymentValue == null
						? null
						: scale(revenue.downPaymentValue),
				fees: revenue.fees.map((fee) => ({
					...fee,
					amount: scale(fee.amount),
				})),
			})),
		})),
		expenses: expenses.slice(-12).map((expense) => ({
			...expense,
			amount: scale(expense.amount),
			notes: `POA — ${expense.notes}`,
		})),
	};
}
