import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Option } from "@/shared/schemas/option";
import {
	assertCan,
	getCurrentEmployeeId,
	getCurrentFirmId,
	hasPermission,
} from "@/shared/session";
import { authMiddleware } from "@/shared/session/middleware";
import { getRequiredServerLoggedUserSession } from "@/shared/session/server";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import { DASHBOARD_ERRORS } from "../constants/errors";
import {
	getDashboardEmployeeOptions,
	getDashboardSummary,
} from "../data/queries";
import type { DashboardSummary } from "../schemas/model";
import { type DashboardSearch, dashboardSearchSchema } from "../schemas/search";

export const dashboardKeys = {
	all: ["dashboard"] as const,
	summary: (search: DashboardSearch) =>
		[...dashboardKeys.all, "summary", search] as const,
	employeeOptions: () => [...dashboardKeys.all, "employee-options"] as const,
};

const getDashboardSummaryFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(dashboardSearchSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<DashboardSummary>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, ["org:dashboard:read_all", "org:dashboard:read_own"]);
			const isAdmin = hasPermission(session, "org:dashboard:read_all");

			return await getDashboardSummary({
				firmId: getCurrentFirmId(session),
				employeeId: isAdmin ? undefined : getCurrentEmployeeId(session),
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
			assertCan(session, ["org:dashboard:read_all", "org:dashboard:read_own"]);

			if (!hasPermission(session, "org:dashboard:read_all")) {
				return [];
			}

			return await getDashboardEmployeeOptions({
				firmId: getCurrentFirmId(session),
			});
		} catch (error) {
			console.error("[getDashboardEmployeeOptions]", error);
			throw new Error(DASHBOARD_ERRORS.EMPLOYEE_OPTIONS_GET_FAILED);
		}
	});

export const getDashboardSummaryQueryOptions = (search: DashboardSearch) =>
	queryOptions({
		queryKey: dashboardKeys.summary(search),
		queryFn: () => getDashboardSummaryFn({ data: search }),
	});

export const getDashboardEmployeeOptionsQueryOptions = () =>
	queryOptions({
		queryKey: dashboardKeys.employeeOptions(),
		queryFn: getDashboardEmployeeOptionsFn,
	});
