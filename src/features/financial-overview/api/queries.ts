import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import { assertCan } from "@/shared/session";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
} from "@/shared/session/server";
import { FINANCIAL_OVERVIEW_ERRORS } from "../constants/errors";
import { FINANCIAL_TITLE_KINDS } from "../constants/values";
import { getFinancialOverviewRecords } from "../data/records";
import { buildFinancialOverviewSummary } from "../data/summary";
import {
	type FinancialOverviewSummary,
	financialOverviewSummarySchema,
} from "../schemas/model";
import {
	type FinancialOverviewSearch,
	financialOverviewSearchDefaults,
	financialOverviewSearchSchema,
} from "../schemas/search";

export interface FinancialOverviewOptions {
	analytics: Option[];
	paymentMethods: Option[];
	legalAreas: Option[];
	kinds: Option[];
}

export const financialOverviewKeys = {
	all: ["financial-overview"] as const,
	summary: (search: FinancialOverviewSearch) =>
		[...financialOverviewKeys.all, "summary", search] as const,
	options: () => [...financialOverviewKeys.all, "options"] as const,
	analytics: () => [...financialOverviewKeys.all, "analytics"] as const,
};

const getFinancialOverviewSummaryFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(financialOverviewSearchSchema)
	.handler(async ({ data }): Promise<FinancialOverviewSummary> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, [
				"org:financial_overview:read_all",
				"org:cash_flow:read_all",
				"org:payables:read_all",
			]);

			const records = await getFinancialOverviewRecords({
				firmId: session.firm.id,
				search: data,
			});

			return financialOverviewSummarySchema.parse(
				buildFinancialOverviewSummary(records),
			);
		} catch (error) {
			console.error("[getFinancialOverviewSummary]", error);
			throw new Error(FINANCIAL_OVERVIEW_ERRORS.SUMMARY_GET_FAILED);
		}
	});

export const getFinancialOverviewSummaryQueryOptions = (
	search: FinancialOverviewSearch = financialOverviewSearchDefaults,
) =>
	queryOptions<FinancialOverviewSummary>({
		queryKey: financialOverviewKeys.summary(search),
		queryFn: () => getFinancialOverviewSummaryFn({ data: search }),
	});

const getFinancialOverviewOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<FinancialOverviewOptions> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, [
				"org:financial_overview:read_all",
				"org:cash_flow:read_all",
				"org:payables:read_all",
			]);

			const [analytics, paymentMethods, legalAreas] = await Promise.all([
				prisma.financialAnalytic.findMany({
					where: { isActive: true },
					orderBy: { label: "asc" },
					select: { id: true, value: true, label: true, isActive: true },
				}),
				prisma.paymentMethod.findMany({
					where: { isActive: true },
					orderBy: { label: "asc" },
					select: { id: true, value: true, label: true, isActive: true },
				}),
				prisma.legalArea.findMany({
					where: { isActive: true },
					orderBy: { label: "asc" },
					select: { id: true, value: true, label: true, isActive: true },
				}),
			]);

			return {
				analytics: optionSchema.array().parse(analytics),
				paymentMethods: optionSchema.array().parse(paymentMethods),
				legalAreas: optionSchema.array().parse(legalAreaSchemaList(legalAreas)),
				kinds: FINANCIAL_TITLE_KINDS.map((k, index) => ({
					id: index + 1,
					value: k.value,
					label: k.label,
					isDisabled: false,
				})),
			};
		} catch (error) {
			console.error("[getFinancialOverviewOptions]", error);
			return {
				analytics: [],
				paymentMethods: [],
				legalAreas: [],
				kinds: [],
			};
		}
	});

function legalAreaSchemaList(
	areas: Array<{ id: number; value: string; label: string; isActive: boolean }>,
) {
	return areas.map((a) => ({
		id: a.id,
		value: a.value,
		label: a.label,
		isActive: a.isActive,
	}));
}

export const getFinancialOverviewOptionsQueryOptions = () =>
	queryOptions<FinancialOverviewOptions>({
		queryKey: financialOverviewKeys.options(),
		queryFn: () => getFinancialOverviewOptionsFn(),
	});

export const getFinancialAnalyticsOptionsQueryOptions = () =>
	getFinancialOverviewOptionsQueryOptions();
