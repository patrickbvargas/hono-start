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
		paymentDate: Date;
	}>;
}

interface DashboardFinancialEvolutionItem {
	month: string;
	revenue: number;
	remuneration: number;
}

interface DashboardCashFlowChartItem {
	month: string;
	entry: number;
	output: number;
	balance: number;
}

interface DashboardCashFlowRow {
	month: string;
	monthLabel: string;
	administrative: number;
	judicial: number;
	succumbency: number;
	entry: number;
	remuneration: number;
	expense: number;
	output: number;
	balance: number;
}

interface DashboardRemunerationRow {
	employeeId: number;
	employeeName: string;
	months: Record<string, number>;
	total: number;
	formattedTotal: string;
}

interface DashboardRemunerationSubtotal {
	label: string;
	months: Record<string, number>;
	total: number;
	formattedTotal: string;
}

interface DashboardPeriod {
	dateFrom?: Date;
	dateTo?: Date;
	hasPeriod: boolean;
}

interface DashboardMonthRange {
	endMonth: Date;
	label: string;
	startMonth: Date;
}

interface ComparisonBoundaries {
	currentStart: Date;
	nextStart: Date;
	previousEndExclusive: Date;
	previousPeriodLabel: string;
	previousStart: Date;
	previousLabel: string;
}

interface GroupTotal {
	label: string;
	value: string;
	total: Prisma.Decimal;
}

interface RevenueTypeAmountTotals {
	administrative: Prisma.Decimal;
	judicial: Prisma.Decimal;
	succumbency: Prisma.Decimal;
}

interface EffectiveEmployeeParams {
	isAdmin: boolean;
	requestedEmployeeId?: number;
	sessionEmployeeId?: number;
}

interface DashboardDimensionFilters {
	legalArea: string[];
	revenueType: string[];
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

function parseLookupValues(values: string[]): string[] {
	return values.filter((value) => value.length > 0);
}

function getDashboardDimensionFilters(
	search: DashboardSearch,
): DashboardDimensionFilters {
	return {
		legalArea: parseLookupValues(search.legalArea),
		revenueType: parseLookupValues(search.revenueType),
	};
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

function getDashboardContractDimensionWhere(
	scope: DashboardScope,
): Prisma.ContractWhereInput {
	const { legalArea, revenueType } = getDashboardDimensionFilters(scope.search);

	return {
		...(legalArea.length > 0
			? { legalArea: { value: { in: legalArea } } }
			: {}),
		...(revenueType.length > 0
			? {
					revenues: {
						some: {
							firmId: scope.firmId,
							deletedAt: null,
							isActive: true,
							type: {
								value: { in: revenueType },
							},
						},
					},
				}
			: {}),
	};
}

function getDashboardRevenueWhere(
	scope: DashboardScope,
): Prisma.RevenueWhereInput {
	const { revenueType } = getDashboardDimensionFilters(scope.search);

	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
		...(revenueType.length > 0 ? { type: { value: { in: revenueType } } } : {}),
		contract: {
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
			...getAssignedContractWhere(scope),
			...getDashboardContractDimensionWhere(scope),
		},
	};
}

function getDashboardFeeRevenueWhere(
	scope: DashboardScope,
): Prisma.FeeWhereInput["revenue"] {
	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
		...(() => {
			const { revenueType } = getDashboardDimensionFilters(scope.search);

			return revenueType.length > 0
				? { type: { value: { in: revenueType } } }
				: {};
		})(),
		contract: {
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
			...getAssignedContractWhere(scope),
			...getDashboardContractDimensionWhere(scope),
		},
	};
}

function getDashboardRemunerationWhere(
	scope: DashboardScope,
): Prisma.RemunerationWhereInput {
	const employeeId = getSelectedEmployeeId(scope);
	const { legalArea, revenueType } = getDashboardDimensionFilters(scope.search);

	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
		...(revenueType.length > 0
			? {
					fee: {
						revenue: {
							type: {
								value: { in: revenueType },
							},
						},
					},
				}
			: {}),
		contractEmployee: {
			...(employeeId ? { employeeId } : {}),
			...(legalArea.length > 0
				? {
						contract: {
							legalArea: {
								value: { in: legalArea },
							},
						},
					}
				: {}),
		},
	};
}

function getDashboardExpenseWhere(
	scope: DashboardScope,
): Prisma.ExpenseWhereInput {
	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
	};
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

function createMonthStart(value: Date): Date {
	return new Date(
		Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1, 0, 0, 0, 0),
	);
}

function createMonthEnd(value: Date): Date {
	return new Date(
		Date.UTC(
			value.getUTCFullYear(),
			value.getUTCMonth() + 1,
			0,
			23,
			59,
			59,
			999,
		),
	);
}

function addMonths(value: Date, months: number): Date {
	return new Date(
		Date.UTC(
			value.getUTCFullYear(),
			value.getUTCMonth() + months,
			1,
			0,
			0,
			0,
			0,
		),
	);
}

function addYears(value: Date, years: number): Date {
	const next = new Date(value);
	next.setUTCFullYear(next.getUTCFullYear() + years);
	return next;
}

function getMonthKey(value: Date): string {
	return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthYearLabel(value: Date): string {
	const formatted = new Intl.DateTimeFormat("pt-BR", {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	})
		.format(value)
		.replace(".", "");

	const [month, year] = formatted.split(" de ");

	if (!month || !year) {
		return formatted;
	}

	return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`;
}

function formatMonthShortYearLabel(value: Date): string {
	const formatted = new Intl.DateTimeFormat("pt-BR", {
		month: "short",
		year: "2-digit",
		timeZone: "UTC",
	})
		.format(value)
		.replace(".", "");

	const [month, year] = formatted.split(" de ");

	if (!month || !year) {
		return formatted;
	}

	return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`;
}

function formatDateRangeLabel(start: Date, endInclusive: Date): string {
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
		timeZone: "UTC",
	});

	return `${dateFormatter.format(start)} a ${dateFormatter.format(endInclusive)}`;
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

function isDateInsideRange(
	value: Date,
	start: Date,
	endExclusive: Date,
): boolean {
	return value >= start && value < endExclusive;
}

function getComparisonBoundaries(
	search: DashboardSearch,
): ComparisonBoundaries {
	const now = new Date();
	const period = getDashboardPeriod(search);

	if (!period.hasPeriod) {
		const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		const previousStart = addYears(currentStart, -1);
		const previousEndExclusive = addYears(nextStart, -1);

		return {
			currentStart,
			nextStart,
			previousStart,
			previousEndExclusive,
			previousLabel: "Período anterior",
			previousPeriodLabel: formatDateRangeLabel(
				previousStart,
				addDays(previousEndExclusive, -1),
			),
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
	const previousStart = addYears(currentStart, -1);
	const previousEndExclusive = addYears(nextStart, -1);

	return {
		currentStart,
		nextStart,
		previousStart,
		previousEndExclusive,
		previousLabel: "Período anterior",
		previousPeriodLabel: formatDateRangeLabel(
			previousStart,
			addDays(previousEndExclusive, -1),
		),
	};
}

function getFinancialEvolutionMonthRange(
	search: DashboardSearch,
): DashboardMonthRange {
	const period = getDashboardPeriod(search);
	const referenceEnd = period.dateTo ?? new Date();

	if (period.dateFrom && period.dateTo) {
		return {
			startMonth: createMonthStart(period.dateFrom),
			endMonth: createMonthStart(period.dateTo),
			label: `${formatMonthYearLabel(createMonthStart(period.dateFrom))} a ${formatMonthYearLabel(createMonthStart(period.dateTo))}`,
		};
	}

	const fallbackStart = createMonthStart(
		period.dateFrom ?? addMonths(referenceEnd, -5),
	);
	const fallbackEnd = createMonthStart(period.dateTo ?? referenceEnd);

	return {
		startMonth: fallbackStart,
		endMonth: fallbackEnd,
		label: `${formatMonthYearLabel(fallbackStart)} a ${formatMonthYearLabel(fallbackEnd)}`,
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

function buildMonthlyFinancialEvolution({
	chartDownPayments,
	chartFees,
	chartRemunerations,
	range,
}: {
	chartDownPayments: Array<{
		downPaymentValue: Prisma.Decimal | null;
		paymentStartDate: Date;
	}>;
	chartFees: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
	}>;
	chartRemunerations: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
	}>;
	range: DashboardMonthRange;
}): DashboardFinancialEvolutionItem[] {
	const buckets = new Map<string, DashboardFinancialEvolutionItem>();

	for (
		let current = range.startMonth;
		current.getTime() <= range.endMonth.getTime();
		current = addMonths(current, 1)
	) {
		buckets.set(getMonthKey(current), {
			month: getMonthKey(current),
			revenue: 0,
			remuneration: 0,
		});
	}

	for (const row of chartDownPayments) {
		const month = getMonthKey(createMonthStart(row.paymentStartDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.revenue += Number(row.downPaymentValue?.toString() ?? 0);
	}

	for (const row of chartFees) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.revenue += Number(row.amount);
	}

	for (const row of chartRemunerations) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.remuneration += Number(row.amount);
	}

	return Array.from(buckets.values());
}

function createRevenueTypeAmountTotals(): RevenueTypeAmountTotals {
	return {
		administrative: new Prisma.Decimal(0),
		judicial: new Prisma.Decimal(0),
		succumbency: new Prisma.Decimal(0),
	};
}

function pushRevenueTypeAmount(
	totals: RevenueTypeAmountTotals,
	revenueTypeValue: string,
	amount: Prisma.Decimal,
) {
	if (revenueTypeValue === "ADMINISTRATIVE") {
		totals.administrative = totals.administrative.add(amount);
		return;
	}

	if (revenueTypeValue === "JUDICIAL") {
		totals.judicial = totals.judicial.add(amount);
		return;
	}

	if (revenueTypeValue === "SUCCUMBENCY") {
		totals.succumbency = totals.succumbency.add(amount);
	}
}

function buildMonthlyCashFlow({
	chartDownPayments,
	chartFees,
	chartRemunerations,
	chartExpenses,
	range,
}: {
	chartDownPayments: Array<{
		downPaymentValue: Prisma.Decimal | null;
		paymentStartDate: Date;
		type: {
			value: string;
		};
	}>;
	chartFees: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
		revenue: {
			type: {
				value: string;
			};
		};
	}>;
	chartRemunerations: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
	}>;
	chartExpenses: Array<{
		amount: Prisma.Decimal;
		expenseDate: Date;
	}>;
	range: DashboardMonthRange;
}): {
	chart: DashboardCashFlowChartItem[];
	table: DashboardCashFlowRow[];
} {
	const buckets = new Map<
		string,
		{
			month: string;
			monthLabel: string;
			entryTypes: RevenueTypeAmountTotals;
			remuneration: Prisma.Decimal;
			expense: Prisma.Decimal;
		}
	>();

	for (
		let current = range.startMonth;
		current.getTime() <= range.endMonth.getTime();
		current = addMonths(current, 1)
	) {
		const monthKey = getMonthKey(current);
		buckets.set(monthKey, {
			month: monthKey,
			monthLabel: formatMonthShortYearLabel(current),
			entryTypes: createRevenueTypeAmountTotals(),
			remuneration: new Prisma.Decimal(0),
			expense: new Prisma.Decimal(0),
		});
	}

	for (const row of chartDownPayments) {
		const month = getMonthKey(createMonthStart(row.paymentStartDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		pushRevenueTypeAmount(
			bucket.entryTypes,
			row.type.value,
			new Prisma.Decimal(row.downPaymentValue?.toString() ?? 0),
		);
	}

	for (const row of chartFees) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		pushRevenueTypeAmount(
			bucket.entryTypes,
			row.revenue.type.value,
			row.amount,
		);
	}

	for (const row of chartRemunerations) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.remuneration = bucket.remuneration.add(row.amount);
	}

	for (const row of chartExpenses) {
		const month = getMonthKey(createMonthStart(row.expenseDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.expense = bucket.expense.add(row.amount);
	}

	const table = Array.from(buckets.values()).map((bucket) => {
		const administrative = Number(bucket.entryTypes.administrative);
		const judicial = Number(bucket.entryTypes.judicial);
		const succumbency = Number(bucket.entryTypes.succumbency);
		const entry = administrative + judicial + succumbency;
		const remuneration = Number(bucket.remuneration);
		const expense = Number(bucket.expense);
		const output = remuneration + expense;
		const balance = entry - output;

		return {
			month: bucket.month,
			monthLabel: bucket.monthLabel,
			administrative,
			judicial,
			succumbency,
			entry,
			remuneration,
			expense,
			output,
			balance,
		};
	});

	return {
		chart: table.map((row) => ({
			month: row.month,
			entry: row.entry,
			output: row.output,
			balance: row.balance,
		})),
		table,
	};
}

function buildMonthlyRemunerationTable({
	range,
	rows,
}: {
	range: DashboardMonthRange;
	rows: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
		contractEmployee: {
			employee: {
				id: number;
				fullName: string;
			};
		};
	}>;
}): {
	months: Array<{
		key: string;
		label: string;
	}>;
	table: DashboardRemunerationRow[];
	subtotal: DashboardRemunerationSubtotal | null;
} {
	const months: Array<{
		key: string;
		label: string;
	}> = [];

	for (
		let current = range.startMonth;
		current.getTime() <= range.endMonth.getTime();
		current = addMonths(current, 1)
	) {
		months.push({
			key: getMonthKey(current),
			label: formatMonthShortYearLabel(current),
		});
	}

	const rowsByEmployee = new Map<
		number,
		{
			employeeId: number;
			employeeName: string;
			totals: Map<string, Prisma.Decimal>;
		}
	>();

	for (const row of rows) {
		const employee = row.contractEmployee.employee;
		const monthKey = getMonthKey(createMonthStart(row.paymentDate));
		const existing = rowsByEmployee.get(employee.id) ?? {
			employeeId: employee.id,
			employeeName: employee.fullName,
			totals: new Map<string, Prisma.Decimal>(),
		};
		const currentValue = existing.totals.get(monthKey) ?? new Prisma.Decimal(0);

		existing.totals.set(monthKey, currentValue.add(row.amount));
		rowsByEmployee.set(employee.id, existing);
	}

	const table = Array.from(rowsByEmployee.values())
		.sort((first, second) => {
			const nameComparison = first.employeeName.localeCompare(
				second.employeeName,
				"pt-BR",
			);

			if (nameComparison !== 0) {
				return nameComparison;
			}

			return first.employeeId - second.employeeId;
		})
		.map((row) => {
			const monthValues = Object.fromEntries(
				months.map((month) => [
					month.key,
					Number(row.totals.get(month.key) ?? new Prisma.Decimal(0)),
				]),
			);
			const total = months.reduce(
				(sum, month) => sum + (monthValues[month.key] ?? 0),
				0,
			);

			return {
				employeeId: row.employeeId,
				employeeName: row.employeeName,
				months: monthValues,
				total,
				formattedTotal: formatter.currency(total),
			};
		});

	const subtotalMonths = Object.fromEntries(
		months.map((month) => [
			month.key,
			table.reduce((sum, row) => sum + (row.months[month.key] ?? 0), 0),
		]),
	);
	const subtotalTotal = months.reduce(
		(sum, month) => sum + (subtotalMonths[month.key] ?? 0),
		0,
	);

	return {
		months,
		table,
		subtotal:
			table.length > 0
				? {
						label: "Subtotal",
						months: subtotalMonths,
						total: subtotalTotal,
						formattedTotal: formatter.currency(subtotalTotal),
					}
				: null,
	};
}

export async function getDashboardSummary(
	scope: DashboardScope,
): Promise<DashboardSummary> {
	const {
		currentStart,
		nextStart,
		previousStart,
		previousEndExclusive,
		previousLabel,
		previousPeriodLabel,
	} = getComparisonBoundaries(scope.search);
	const period = getDashboardPeriod(scope.search);
	const paymentDateWhere = buildDashboardPaymentDateWhere(period);
	const revenueWhere = getDashboardRevenueWhere(scope);
	const remunerationWhere = getDashboardRemunerationWhere(scope);
	const expenseWhere = getDashboardExpenseWhere(scope);
	const firmWhere = {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
	};
	const chartMonthRange = getFinancialEvolutionMonthRange(scope.search);
	const chartWindowStart = period.dateFrom
		? new Date(
				Math.max(
					period.dateFrom.getTime(),
					chartMonthRange.startMonth.getTime(),
				),
			)
		: chartMonthRange.startMonth;
	const chartWindowEnd = period.dateTo
		? new Date(
				Math.min(
					period.dateTo.getTime(),
					createMonthEnd(chartMonthRange.endMonth).getTime(),
				),
			)
		: createMonthEnd(chartMonthRange.endMonth);

	const [
		revenues,
		currentFees,
		previousFees,
		allRemunerations,
		currentRemunerations,
		previousRemunerations,
		chartDownPayments,
		chartFees,
		chartRemunerations,
		tableRemunerations,
		allExpenses,
		currentExpenses,
		previousExpenses,
		chartCashFlowDownPayments,
		chartCashFlowFees,
		chartCashFlowExpenses,
	] = await Promise.all([
		prisma.revenue.findMany({
			where: revenueWhere,
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
						paymentDate: true,
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
				revenue: getDashboardFeeRevenueWhere(scope),
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
					lt: previousEndExclusive,
				},
				revenue: getDashboardFeeRevenueWhere(scope),
			},
			select: {
				amount: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...remunerationWhere,
				...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
			},
			select: {
				amount: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...remunerationWhere,
				paymentDate: {
					gte: currentStart,
					lt: nextStart,
				},
			},
			select: {
				amount: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...remunerationWhere,
				paymentDate: {
					gte: previousStart,
					lt: previousEndExclusive,
				},
			},
			select: {
				amount: true,
			},
		}),
		prisma.revenue.findMany({
			where: {
				...revenueWhere,
				paymentStartDate: {
					gte: chartWindowStart,
					lte: chartWindowEnd,
				},
			},
			select: {
				downPaymentValue: true,
				paymentStartDate: true,
			},
		}),
		prisma.fee.findMany({
			where: {
				...firmWhere,
				paymentDate: {
					gte: chartWindowStart,
					lte: chartWindowEnd,
				},
				revenue: getDashboardFeeRevenueWhere(scope),
			},
			select: {
				amount: true,
				paymentDate: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...remunerationWhere,
				paymentDate: {
					gte: chartWindowStart,
					lte: chartWindowEnd,
				},
			},
			select: {
				amount: true,
				paymentDate: true,
			},
		}),
		prisma.remuneration.findMany({
			where: {
				...remunerationWhere,
				...(paymentDateWhere ? { paymentDate: paymentDateWhere } : {}),
			},
			select: {
				amount: true,
				paymentDate: true,
				contractEmployee: {
					select: {
						employee: {
							select: {
								id: true,
								fullName: true,
							},
						},
					},
				},
			},
		}),
		scope.isAdmin
			? prisma.expense.findMany({
					where: {
						...expenseWhere,
						...(paymentDateWhere ? { expenseDate: paymentDateWhere } : {}),
					},
					select: {
						amount: true,
					},
				})
			: Promise.resolve([]),
		scope.isAdmin
			? prisma.expense.findMany({
					where: {
						...expenseWhere,
						expenseDate: {
							gte: currentStart,
							lt: nextStart,
						},
					},
					select: {
						amount: true,
					},
				})
			: Promise.resolve([]),
		scope.isAdmin
			? prisma.expense.findMany({
					where: {
						...expenseWhere,
						expenseDate: {
							gte: previousStart,
							lt: previousEndExclusive,
						},
					},
					select: {
						amount: true,
					},
				})
			: Promise.resolve([]),
		scope.isAdmin
			? prisma.revenue.findMany({
					where: {
						...revenueWhere,
						paymentStartDate: {
							gte: chartWindowStart,
							lte: chartWindowEnd,
						},
					},
					select: {
						downPaymentValue: true,
						paymentStartDate: true,
						type: {
							select: {
								value: true,
							},
						},
					},
				})
			: Promise.resolve([]),
		scope.isAdmin
			? prisma.fee.findMany({
					where: {
						...firmWhere,
						paymentDate: {
							gte: chartWindowStart,
							lte: chartWindowEnd,
						},
						revenue: getDashboardFeeRevenueWhere(scope),
					},
					select: {
						amount: true,
						paymentDate: true,
						revenue: {
							select: {
								type: {
									select: {
										value: true,
									},
								},
							},
						},
					},
				})
			: Promise.resolve([]),
		scope.isAdmin
			? prisma.expense.findMany({
					where: {
						...expenseWhere,
						expenseDate: {
							gte: chartWindowStart,
							lte: chartWindowEnd,
						},
					},
					select: {
						amount: true,
						expenseDate: true,
					},
				})
			: Promise.resolve([]),
	]);

	const revenueTotal = sumDecimal(
		revenues
			.filter((revenue) => isDateInsidePeriod(revenue.paymentStartDate, period))
			.map((revenue) => revenue.totalValue),
	);
	const revenueReceived = sumDecimal(
		revenues.map((revenue) => getRevenueReceived(revenue, period)),
	);
	const currentPlannedRevenue = sumDecimal(
		revenues
			.filter((revenue) =>
				isDateInsideRange(revenue.paymentStartDate, currentStart, nextStart),
			)
			.map((revenue) => revenue.totalValue),
	);
	const previousPlannedRevenue = sumDecimal(
		revenues
			.filter((revenue) =>
				isDateInsideRange(
					revenue.paymentStartDate,
					previousStart,
					previousEndExclusive,
				),
			)
			.map((revenue) => revenue.totalValue),
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
	const expenseTotal = sumDecimal(
		allExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const currentExpense = sumDecimal(
		currentExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const previousExpense = sumDecimal(
		previousExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const totalBalance = revenueReceived
		.minus(remunerationTotal)
		.minus(expenseTotal);
	const currentBalance = currentRevenue
		.minus(currentRemuneration)
		.minus(currentExpense);
	const previousBalance = previousRevenue
		.minus(previousRemuneration)
		.minus(previousExpense);
	const financialEvolution = buildMonthlyFinancialEvolution({
		chartDownPayments,
		chartFees,
		chartRemunerations,
		range: chartMonthRange,
	});
	const remunerationByCollaborator = buildMonthlyRemunerationTable({
		range: chartMonthRange,
		rows: tableRemunerations,
	});
	const cashFlow = scope.isAdmin
		? buildMonthlyCashFlow({
				chartDownPayments: chartCashFlowDownPayments,
				chartFees: chartCashFlowFees,
				chartRemunerations,
				chartExpenses: chartCashFlowExpenses,
				range: chartMonthRange,
			})
		: null;
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

	return dashboardSummarySchema.parse({
		isAdmin: scope.isAdmin,
		scopeLabel: scope.isAdmin ? "Visão da firma" : "Minha visão",
		metrics: [
			...(scope.isAdmin
				? [
						{
							label: "Saldo total",
							value: Number(totalBalance),
							formattedValue: formatter.currency(Number(totalBalance)),
							description: "Total de honorários recebidos menos remunerações e despesas.",
							tone: Number(totalBalance) < 0 ? "danger" : "default",
							previousLabel,
							currentValue: Number(currentBalance),
							previousValue: Number(previousBalance),
							formattedCurrentValue: formatter.currency(Number(currentBalance)),
							formattedPreviousValue: formatter.currency(
								Number(previousBalance),
							),
							previousPeriodLabel,
							changePercent: calculateChangePercent(
								currentBalance,
								previousBalance,
							),
						},
					]
				: []),
			{
				label: "Receita prevista",
				value: Number(revenueTotal),
				formattedValue: formatter.currency(Number(revenueTotal)),
				description: "Total de honorários previsto para recebimento no período.",
				tone: "default",
				previousLabel,
				currentValue: Number(currentPlannedRevenue),
				previousValue: Number(previousPlannedRevenue),
				formattedCurrentValue: formatter.currency(
					Number(currentPlannedRevenue),
				),
				formattedPreviousValue: formatter.currency(
					Number(previousPlannedRevenue),
				),
				previousPeriodLabel,
				changePercent: calculateChangePercent(
					currentPlannedRevenue,
					previousPlannedRevenue,
				),
			},
			{
				label: "Receita recebida",
				value: Number(revenueReceived),
				formattedValue: formatter.currency(Number(revenueReceived)),
				description: "Total de honorários recebido no período.",
				tone: "success",
				previousLabel,
				currentValue: Number(currentRevenue),
				previousValue: Number(previousRevenue),
				formattedCurrentValue: formatter.currency(Number(currentRevenue)),
				formattedPreviousValue: formatter.currency(Number(previousRevenue)),
				previousPeriodLabel,
				changePercent: calculateChangePercent(currentRevenue, previousRevenue),
			},
			{
				label: "Remunerações",
				value: Number(remunerationTotal),
				formattedValue: formatter.currency(Number(remunerationTotal)),
				description: "Total gerado para colaboradores no período.",
				tone: "warning",
				previousLabel,
				currentValue: Number(currentRemuneration),
				previousValue: Number(previousRemuneration),
				formattedCurrentValue: formatter.currency(Number(currentRemuneration)),
				formattedPreviousValue: formatter.currency(
					Number(previousRemuneration),
				),
				previousPeriodLabel,
				changePercent: calculateChangePercent(
					currentRemuneration,
					previousRemuneration,
				),
			},
		],
		legalAreaRevenue: mapBreakdown(legalAreaGroups, revenueReceived),
		revenueTypeRevenue: mapBreakdown(revenueTypeGroups, revenueReceived),
		remunerationMonths: remunerationByCollaborator.months,
		remunerationTable: remunerationByCollaborator.table,
		remunerationSubtotal: remunerationByCollaborator.subtotal,
		financialEvolutionLabel: chartMonthRange.label,
		financialEvolution,
		cashFlow: cashFlow
			? {
					totalBalance: Number(totalBalance),
					formattedTotalBalance: formatter.currency(Number(totalBalance)),
					chartLabel: chartMonthRange.label,
					chart: cashFlow.chart,
					table: cashFlow.table,
				}
			: null,
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
