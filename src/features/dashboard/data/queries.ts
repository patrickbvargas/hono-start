import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import { prisma } from "@/shared/lib/prisma";
import type { Option } from "@/shared/schemas/option";
import type { QueryManyReturnType } from "@/shared/types/api";
import {
	type DashboardSummary,
	dashboardSummarySchema,
} from "../schemas/model";
import type { DashboardSearch } from "../schemas/search";

interface DashboardScope {
	firmId: number;
	employeeId?: number;
	isAdmin: boolean;
	search: DashboardSearch;
}

interface RevenueRow {
	totalValue: Prisma.Decimal;
	downPaymentValue: Prisma.Decimal | null;
	paymentStartDate: Date;
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

interface DashboardPeriod {
	dateFrom?: Date;
	dateTo?: Date;
	hasPeriod: boolean;
}

interface ComparisonBoundaries {
	currentStart: Date;
	nextStart: Date;
	previousStart: Date;
	currentLabel: string;
}

interface GroupTotal {
	label: string;
	value: string;
	total: Prisma.Decimal;
}

interface EffectiveEmployeeParams {
	isAdmin: boolean;
	requestedEmployeeId?: number;
	sessionEmployeeId?: number;
}

function parseOptionalEntityId(value: string): number | undefined {
	if (!value) {
		return undefined;
	}

	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		return undefined;
	}

	return parsed;
}

export function getEffectiveDashboardEmployeeId({
	isAdmin,
	requestedEmployeeId,
	sessionEmployeeId,
}: EffectiveEmployeeParams): number | undefined {
	if (isAdmin) {
		return requestedEmployeeId;
	}

	return sessionEmployeeId;
}

function getSelectedEmployeeId(scope: DashboardScope): number | undefined {
	return getEffectiveDashboardEmployeeId({
		isAdmin: scope.isAdmin,
		requestedEmployeeId: parseOptionalEntityId(scope.search.employeeId),
		sessionEmployeeId: scope.employeeId,
	});
}

function getAssignedContractWhere(scope: DashboardScope) {
	const employeeId = getSelectedEmployeeId(scope);

	if (scope.isAdmin && !employeeId) {
		return {};
	}

	if (!employeeId) {
		throw new Error(
			"Não foi possível identificar o colaborador da sessão para consultar o dashboard",
		);
	}

	return {
		assignments: {
			some: {
				firmId: scope.firmId,
				employeeId,
				deletedAt: null,
				isActive: true,
			},
		},
	};
}

function createDayStart(value: string): Date {
	return new Date(`${value}T00:00:00.000Z`);
}

function createDayEnd(value: string): Date {
	return new Date(`${value}T23:59:59.999Z`);
}

function addDays(value: Date, days: number): Date {
	const next = new Date(value);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

function getDashboardPeriod(search: DashboardSearch): DashboardPeriod {
	const dateFrom = search.dateFrom
		? createDayStart(search.dateFrom)
		: undefined;
	const dateTo = search.dateTo ? createDayEnd(search.dateTo) : undefined;

	return {
		dateFrom,
		dateTo,
		hasPeriod: Boolean(dateFrom || dateTo),
	};
}

export function buildDashboardPaymentDateWhere(
	period: DashboardPeriod,
): Prisma.DateTimeFilter | undefined {
	if (!period.hasPeriod) {
		return undefined;
	}

	return {
		...(period.dateFrom ? { gte: period.dateFrom } : {}),
		...(period.dateTo ? { lte: period.dateTo } : {}),
	};
}

function isDateInsidePeriod(value: Date, period: DashboardPeriod): boolean {
	if (!period.hasPeriod) {
		return true;
	}

	if (period.dateFrom && value < period.dateFrom) {
		return false;
	}

	if (period.dateTo && value > period.dateTo) {
		return false;
	}

	return true;
}

function getComparisonBoundaries(
	search: DashboardSearch,
): ComparisonBoundaries {
	const now = new Date();
	const period = getDashboardPeriod(search);

	if (!period.hasPeriod) {
		return {
			currentStart: new Date(now.getFullYear(), now.getMonth(), 1),
			nextStart: new Date(now.getFullYear(), now.getMonth() + 1, 1),
			previousStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
			currentLabel: "do mês",
		};
	}

	const currentStart =
		period.dateFrom ??
		new Date(
			period.dateTo?.getUTCFullYear() ?? now.getUTCFullYear(),
			period.dateTo?.getUTCMonth() ?? now.getUTCMonth(),
			1,
		);
	const inclusiveEnd =
		period.dateTo ?? createDayEnd(now.toISOString().slice(0, 10));
	const nextStart = addDays(
		createDayStart(inclusiveEnd.toISOString().slice(0, 10)),
		1,
	);
	const daySpan = Math.max(
		1,
		Math.round(
			(nextStart.getTime() - currentStart.getTime()) / (24 * 60 * 60 * 1000),
		),
	);
	const previousStart = addDays(currentStart, -daySpan);

	return {
		currentStart,
		nextStart,
		previousStart,
		currentLabel: "do período",
	};
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

function getRevenueReceived(
	revenue: RevenueRow,
	period: DashboardPeriod,
): Prisma.Decimal {
	const downPayment = isDateInsidePeriod(revenue.paymentStartDate, period)
		? new Prisma.Decimal(revenue.downPaymentValue?.toString() ?? 0)
		: new Prisma.Decimal(0);

	return revenue.fees.reduce(
		(total, fee) => total.add(fee.amount),
		downPayment,
	);
}

function getRecentDate(value: Date): string {
	return value.toISOString();
}

export async function getDashboardSummary(
	scope: DashboardScope,
): Promise<DashboardSummary> {
	const { currentStart, nextStart, previousStart, currentLabel } =
		getComparisonBoundaries(scope.search);
	const period = getDashboardPeriod(scope.search);
	const paymentDateWhere = buildDashboardPaymentDateWhere(period);
	const employeeId = getSelectedEmployeeId(scope);
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
			select: {
				totalValue: true,
				downPaymentValue: true,
				paymentStartDate: true,
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
						...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
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
				...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
				contractEmployee: employeeId ? { employeeId } : {},
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
				contractEmployee: employeeId ? { employeeId } : {},
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
				contractEmployee: employeeId ? { employeeId } : {},
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
				...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
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
				...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
				contractEmployee: employeeId ? { employeeId } : {},
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
	const revenueReceived = sumDecimal(
		revenues.map((revenue) => getRevenueReceived(revenue, period)),
	);
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
		const received = getRevenueReceived(revenue, period);
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
				description: period.hasPeriod
					? "Pagamentos gerados no período filtrado"
					: "Pagamentos gerados no escopo atual",
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
				label: `Receita ${currentLabel}`,
				currentValue: Number(currentRevenue),
				previousValue: Number(previousRevenue),
				formattedCurrentValue: formatter.currency(Number(currentRevenue)),
				formattedPreviousValue: formatter.currency(Number(previousRevenue)),
				changePercent: calculateChangePercent(currentRevenue, previousRevenue),
			},
			{
				label: `Remuneração ${currentLabel}`,
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

export async function getDashboardEmployeeOptions({
	firmId,
}: {
	firmId: number;
}): Promise<QueryManyReturnType<Option>> {
	const employees = await prisma.employee.findMany({
		where: {
			firmId,
			deletedAt: null,
			isActive: true,
		},
		orderBy: [{ fullName: "asc" }, { id: "asc" }],
		select: {
			id: true,
			fullName: true,
		},
	});

	return employees.map((employee) => ({
		id: employee.id,
		value: String(employee.id),
		label: employee.fullName,
		isDisabled: false,
	}));
}
