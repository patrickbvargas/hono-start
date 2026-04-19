import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import { prisma } from "@/shared/lib/prisma";
import {
	type DashboardSummary,
	dashboardSummarySchema,
} from "../schemas/model";

interface DashboardScope {
	firmId: number;
	employeeId?: number;
	isAdmin: boolean;
}

interface RevenueRow {
	totalValue: Prisma.Decimal;
	downPaymentValue: Prisma.Decimal | null;
	type: {
		label: string;
		value: string;
	};
	contract: {
		legalArea: {
			label: string;
			value: string;
		};
	};
	fees: Array<{
		amount: Prisma.Decimal;
	}>;
}

interface GroupTotal {
	label: string;
	value: string;
	total: Prisma.Decimal;
}

function getAssignedContractWhere(scope: DashboardScope) {
	if (scope.isAdmin) {
		return {};
	}

	return {
		assignments: {
			some: {
				employeeId: scope.employeeId,
				deletedAt: null,
				isActive: true,
			},
		},
	};
}

function getMonthBoundaries() {
	const now = new Date();
	const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

	return { currentStart, nextStart, previousStart };
}

function sumDecimal(values: Prisma.Decimal[]): Prisma.Decimal {
	return values.reduce(
		(total, value) => total.add(value),
		new Prisma.Decimal(0),
	);
}

function calculateChangePercent(
	currentValue: Prisma.Decimal,
	previousValue: Prisma.Decimal,
): number {
	if (previousValue.equals(0)) {
		if (currentValue.equals(0)) {
			return 0;
		}

		return 100;
	}

	return Number(currentValue.minus(previousValue).div(previousValue).mul(100));
}

function pushGroupTotal(groups: Map<string, GroupTotal>, item: GroupTotal) {
	const existing = groups.get(item.value);

	if (existing) {
		existing.total = existing.total.add(item.total);
		return;
	}

	groups.set(item.value, item);
}

function mapBreakdown(groups: Map<string, GroupTotal>, total: Prisma.Decimal) {
	return Array.from(groups.values())
		.sort((first, second) => Number(second.total.minus(first.total)))
		.map((item) => ({
			label: item.label,
			value: item.value,
			total: Number(item.total),
			formattedTotal: formatter.currency(Number(item.total)),
			percentage: total.equals(0) ? 0 : Number(item.total.div(total).mul(100)),
		}));
}

function getRevenueReceived(revenue: RevenueRow): Prisma.Decimal {
	return revenue.fees.reduce(
		(total, fee) => total.add(fee.amount),
		new Prisma.Decimal(revenue.downPaymentValue?.toString() ?? 0),
	);
}

function getRecentDate(value: Date): string {
	return value.toISOString();
}

export async function getDashboardSummary(
	scope: DashboardScope,
): Promise<DashboardSummary> {
	const { currentStart, nextStart, previousStart } = getMonthBoundaries();
	const contractWhere = getAssignedContractWhere(scope);
	const firmWhere = {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
	};

	const [
		clientsCount,
		activeContractsCount,
		revenues,
		currentFees,
		previousFees,
		allRemunerations,
		currentRemunerations,
		previousRemunerations,
		recentClients,
		recentContracts,
		recentFees,
		recentRemunerations,
	] = await Promise.all([
		prisma.client.count({ where: firmWhere }),
		prisma.contract.count({
			where: {
				...firmWhere,
				...contractWhere,
				status: {
					value: "ACTIVE",
				},
			},
		}),
		prisma.revenue.findMany({
			where: {
				...firmWhere,
				contract: {
					...firmWhere,
					...contractWhere,
				},
			},
			include: {
				type: {
					select: {
						label: true,
						value: true,
					},
				},
				contract: {
					select: {
						legalArea: {
							select: {
								label: true,
								value: true,
							},
						},
					},
				},
				fees: {
					where: {
						deletedAt: null,
						isActive: true,
					},
					select: {
						amount: true,
					},
				},
			},
		}),
		prisma.fee.findMany({
			where: {
				...firmWhere,
				paymentDate: {
					gte: currentStart,
					lt: nextStart,
				},
				revenue: {
					contract: {
						...firmWhere,
						...contractWhere,
					},
				},
			},
			select: {
				amount: true,
			},
		}),
		prisma.fee.findMany({
			where: {
				...firmWhere,
				paymentDate: {
					gte: previousStart,
					lt: currentStart,
				},
				revenue: {
					contract: {
						...firmWhere,
						...contractWhere,
					},
				},
			},
			select: {
				amount: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...firmWhere,
				contractEmployee: scope.isAdmin
					? {}
					: {
							employeeId: scope.employeeId,
						},
			},
			select: {
				amount: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...firmWhere,
				paymentDate: {
					gte: currentStart,
					lt: nextStart,
				},
				contractEmployee: scope.isAdmin
					? {}
					: {
							employeeId: scope.employeeId,
						},
			},
			select: {
				amount: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...firmWhere,
				paymentDate: {
					gte: previousStart,
					lt: currentStart,
				},
				contractEmployee: scope.isAdmin
					? {}
					: {
							employeeId: scope.employeeId,
						},
			},
			select: {
				amount: true,
			},
		}),
		prisma.client.findMany({
			where: firmWhere,
			orderBy: { updatedAt: "desc" },
			take: 5,
			select: {
				id: true,
				fullName: true,
				updatedAt: true,
			},
		}),
		prisma.contract.findMany({
			where: {
				...firmWhere,
				...contractWhere,
			},
			orderBy: { updatedAt: "desc" },
			take: 5,
			select: {
				id: true,
				processNumber: true,
				updatedAt: true,
				client: {
					select: {
						fullName: true,
					},
				},
			},
		}),
		prisma.fee.findMany({
			where: {
				...firmWhere,
				revenue: {
					contract: {
						...firmWhere,
						...contractWhere,
					},
				},
			},
			orderBy: { paymentDate: "desc" },
			take: 5,
			select: {
				id: true,
				amount: true,
				paymentDate: true,
				revenue: {
					select: {
						contract: {
							select: {
								processNumber: true,
								client: {
									select: {
										fullName: true,
									},
								},
							},
						},
					},
				},
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...firmWhere,
				contractEmployee: scope.isAdmin
					? {}
					: {
							employeeId: scope.employeeId,
						},
			},
			orderBy: { paymentDate: "desc" },
			take: 5,
			select: {
				id: true,
				amount: true,
				paymentDate: true,
				contractEmployee: {
					select: {
						employee: {
							select: {
								fullName: true,
							},
						},
						contract: {
							select: {
								processNumber: true,
							},
						},
					},
				},
			},
		}),
	]);

	const revenueTotal = sumDecimal(
		revenues.map((revenue) => revenue.totalValue),
	);
	const revenueReceived = sumDecimal(revenues.map(getRevenueReceived));
	const currentRevenue = sumDecimal(currentFees.map((fee) => fee.amount));
	const previousRevenue = sumDecimal(previousFees.map((fee) => fee.amount));
	const currentRemuneration = sumDecimal(
		currentRemunerations.map((remuneration) => remuneration.amount),
	);
	const previousRemuneration = sumDecimal(
		previousRemunerations.map((remuneration) => remuneration.amount),
	);
	const remunerationTotal = sumDecimal(
		allRemunerations.map((remuneration) => remuneration.amount),
	);
	const legalAreaGroups = new Map<string, GroupTotal>();
	const revenueTypeGroups = new Map<string, GroupTotal>();

	for (const revenue of revenues) {
		const received = getRevenueReceived(revenue);
		pushGroupTotal(legalAreaGroups, {
			label: revenue.contract.legalArea.label,
			value: revenue.contract.legalArea.value,
			total: received,
		});
		pushGroupTotal(revenueTypeGroups, {
			label: revenue.type.label,
			value: revenue.type.value,
			total: received,
		});
	}

	const recentActivity = [
		...recentClients.map((client) => ({
			id: `client-${client.id}`,
			type: "client" as const,
			label: "Cliente atualizado",
			description: client.fullName,
			date: getRecentDate(client.updatedAt),
			formattedDate: formatter.date(client.updatedAt.toISOString()),
			amount: null,
			formattedAmount: null,
		})),
		...recentContracts.map((contract) => ({
			id: `contract-${contract.id}`,
			type: "contract" as const,
			label: "Contrato atualizado",
			description: `${contract.processNumber} • ${contract.client.fullName}`,
			date: getRecentDate(contract.updatedAt),
			formattedDate: formatter.date(contract.updatedAt.toISOString()),
			amount: null,
			formattedAmount: null,
		})),
		...recentFees.map((fee) => ({
			id: `fee-${fee.id}`,
			type: "fee" as const,
			label: "Honorário recebido",
			description: `${fee.revenue.contract.processNumber} • ${fee.revenue.contract.client.fullName}`,
			date: getRecentDate(fee.paymentDate),
			formattedDate: formatter.date(fee.paymentDate.toISOString()),
			amount: Number(fee.amount),
			formattedAmount: formatter.currency(Number(fee.amount)),
		})),
		...recentRemunerations.map((remuneration) => ({
			id: `remuneration-${remuneration.id}`,
			type: "remuneration" as const,
			label: "Remuneração gerada",
			description: `${remuneration.contractEmployee.employee.fullName} • ${remuneration.contractEmployee.contract.processNumber}`,
			date: getRecentDate(remuneration.paymentDate),
			formattedDate: formatter.date(remuneration.paymentDate.toISOString()),
			amount: Number(remuneration.amount),
			formattedAmount: formatter.currency(Number(remuneration.amount)),
		})),
	]
		.sort((first, second) => second.date.localeCompare(first.date))
		.slice(0, 10);

	return dashboardSummarySchema.parse({
		isAdmin: scope.isAdmin,
		scopeLabel: scope.isAdmin ? "Visão da firma" : "Minha visão",
		metrics: [
			{
				label: "Receita prevista",
				value: Number(revenueTotal),
				formattedValue: formatter.currency(Number(revenueTotal)),
				description: "Total planejado em receitas ativas",
				tone: "default",
			},
			{
				label: "Receita recebida",
				value: Number(revenueReceived),
				formattedValue: formatter.currency(Number(revenueReceived)),
				description: "Entradas registradas e entradas iniciais",
				tone: "success",
			},
			{
				label: "Remunerações",
				value: Number(remunerationTotal),
				formattedValue: formatter.currency(Number(remunerationTotal)),
				description: "Pagamentos gerados nos meses comparados",
				tone: "warning",
			},
			{
				label: "Contratos ativos",
				value: activeContractsCount,
				formattedValue: String(activeContractsCount),
				description: `${clientsCount} clientes ativos no escopo`,
				tone: "default",
			},
		],
		comparisons: [
			{
				label: "Receita do mês",
				currentValue: Number(currentRevenue),
				previousValue: Number(previousRevenue),
				formattedCurrentValue: formatter.currency(Number(currentRevenue)),
				formattedPreviousValue: formatter.currency(Number(previousRevenue)),
				changePercent: calculateChangePercent(currentRevenue, previousRevenue),
			},
			{
				label: "Remuneração do mês",
				currentValue: Number(currentRemuneration),
				previousValue: Number(previousRemuneration),
				formattedCurrentValue: formatter.currency(Number(currentRemuneration)),
				formattedPreviousValue: formatter.currency(
					Number(previousRemuneration),
				),
				changePercent: calculateChangePercent(
					currentRemuneration,
					previousRemuneration,
				),
			},
		],
		legalAreaRevenue: mapBreakdown(legalAreaGroups, revenueReceived),
		revenueTypeRevenue: mapBreakdown(revenueTypeGroups, revenueReceived),
		recentActivity,
	});
}
