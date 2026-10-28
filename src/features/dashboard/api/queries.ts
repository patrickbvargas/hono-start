import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { enrichEmployeeAvatars } from "@/features/authentication";
import type { Option } from "@/shared/schemas/option";
import { assertCan, hasPermission } from "@/shared/session";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
} from "@/shared/session/server";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import { DASHBOARD_ERRORS } from "../constants/errors";
import { getDashboardDrilldown } from "../data/drilldown";
import {
	getDashboardEmployeeOptions,
	getDashboardSummary,
} from "../data/queries";
import {
	type DashboardDrilldownInput,
	type DashboardDrilldownResult,
	dashboardDrilldownInputSchema,
	dashboardDrilldownResultSchema,
} from "../schemas/drilldown";
import type { DashboardSummary } from "../schemas/model";
import { type DashboardSearch, dashboardSearchSchema } from "../schemas/search";

export const dashboardKeys = {
	all: ["dashboard"] as const,
	drilldown: (input: DashboardDrilldownInput) =>
		["dashboard", "drilldown", input] as const,
	summary: (search: DashboardSearch) =>
		[...dashboardKeys.all, "summary", search] as const,
	employeeOptions: () => [...dashboardKeys.all, "employee-options"] as const,
};

const getDashboardDrilldownFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(dashboardDrilldownInputSchema)
	.handler(async ({ data }) => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, [
				"org:dashboard:read_all",
				"org:dashboard:read_own",
				"org:expenses:read",
			]);
			return dashboardDrilldownResultSchema.parse(
				await getDashboardDrilldown(
					{
						firmId: session.firm.id,
						employeeId: session.employee.id ?? undefined,
						employeeTypeValue: session.employeeType?.value,
						isAdmin: hasPermission(session, "org:dashboard:read_all"),
						canReadCashFlow: hasPermission(
							session,
							"org:dashboard:read_cash_flow",
						),
						access: {
							revenue:
								hasPermission(session, "org:fees:read_all") ||
								hasPermission(session, "org:fees:read_assigned"),
							remuneration:
								hasPermission(session, "org:remunerations:read_all") ||
								hasPermission(session, "org:remunerations:read_own"),
							expense: hasPermission(session, "org:expenses:read"),
							revenueAll: hasPermission(session, "org:fees:read_all"),
							remunerationAll: hasPermission(
								session,
								"org:remunerations:read_all",
							),
						},
						search: data.search,
					},
					data,
				),
			);
		} catch (error) {
			console.error("[getDashboardDrilldown]", error);
			throw new Error(DASHBOARD_ERRORS.DRILLDOWN_GET_FAILED);
		}
	});

export const getDashboardDrilldownQueryOptions = (
	input: DashboardDrilldownInput,
) =>
	queryOptions<DashboardDrilldownResult>({
		queryKey: dashboardKeys.drilldown(input),
		queryFn: () => getDashboardDrilldownFn({ data: input }),
	});

const getDashboardSummaryFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(dashboardSearchSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<DashboardSummary>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, [
				"org:dashboard:read_all",
				"org:dashboard:read_own",
				"org:expenses:read",
			]);
			const isAdmin = hasPermission(session, "org:dashboard:read_all");

			return await getDashboardSummary({
				firmId: session.firm.id,
				employeeId: session.employee.id ?? undefined,
				employeeTypeValue: session.employeeType?.value,
				access: {
					revenue:
						hasPermission(session, "org:fees:read_all") ||
						hasPermission(session, "org:fees:read_assigned"),
					remuneration:
						hasPermission(session, "org:remunerations:read_all") ||
						hasPermission(session, "org:remunerations:read_own"),
					expense: hasPermission(session, "org:expenses:read"),
					revenueAll: hasPermission(session, "org:fees:read_all"),
					remunerationAll: hasPermission(session, "org:remunerations:read_all"),
				},
				isAdmin,
				canReadCashFlow: hasPermission(session, "org:dashboard:read_cash_flow"),
				search: data,
			});
		} catch (error) {
			console.error("[getDashboardSummary]", error);
			throw new Error(DASHBOARD_ERRORS.GET_FAILED);
		}
	});

const getDashboardEmployeeOptionsFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, [
				"org:dashboard:read_all",
				"org:dashboard:read_own",
				"org:expenses:read",
			]);

			if (
				!hasPermission(session, "org:dashboard:read_all") ||
				!hasPermission(session, "org:employees:read")
			) {
				return [];
			}

			return await enrichEmployeeAvatars(
				await getDashboardEmployeeOptions({
					firmId: session.firm.id,
				}),
			);
		} catch (error) {
			console.error("[getDashboardEmployeeOptions]", error);
			throw new Error(DASHBOARD_ERRORS.EMPLOYEE_OPTIONS_GET_FAILED);
		}
	});

export const getDashboardSummaryQueryOptions = (search: DashboardSearch) =>
	queryOptions({
		queryKey: dashboardKeys.summary(search),
		meta: { refreshOnMutation: true },
		queryFn: () => getDashboardSummaryFn({ data: search }),
	});

export const getDashboardEmployeeOptionsQueryOptions = () =>
	queryOptions({
		staleTime: 60_000,
		meta: { refreshOnMutation: true },
		queryKey: dashboardKeys.employeeOptions(),
		queryFn: getDashboardEmployeeOptionsFn,
	});
