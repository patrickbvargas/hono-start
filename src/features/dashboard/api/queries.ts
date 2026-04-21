import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Option } from "@/shared/schemas/option";
import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	getServerLoggedUserSession,
	isAdminSession,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import { DASHBOARD_DATA_CACHE_KEY } from "../constants/cache";
import { DASHBOARD_ERRORS } from "../constants/errors";
import {
	getDashboardEmployeeOptions,
	getDashboardSummary,
} from "../data/queries";
import type { DashboardSummary } from "../schemas/model";
import { type DashboardSearch, dashboardSearchSchema } from "../schemas/search";

const getDashboardSummaryFn = createServerFn({ method: "GET" })
	.inputValidator(dashboardSearchSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<DashboardSummary>> => {
		try {
			const session = getServerLoggedUserSession();
			const isAdmin = isAdminSession(session);

			return await getDashboardSummary({
				firmId: getCurrentFirmId(session),
				employeeId: isAdmin ? undefined : getCurrentEmployeeId(session),
				isAdmin,
				search: data,
			});
		} catch (error) {
			console.error("[getDashboardSummary]", error);
			throw new Error(DASHBOARD_ERRORS.GET_FAILED);
		}
	});

const getDashboardEmployeeOptionsFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<QueryManyReturnType<Option>> => {
	try {
		const session = getServerLoggedUserSession();

		if (!isAdminSession(session)) {
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
		queryKey: [DASHBOARD_DATA_CACHE_KEY, "summary", search],
		queryFn: () => getDashboardSummaryFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getDashboardEmployeeOptionsQueryOptions = () =>
	queryOptions({
		queryKey: [DASHBOARD_DATA_CACHE_KEY, "employee-options"],
		queryFn: getDashboardEmployeeOptionsFn,
		staleTime: 5 * 60 * 1000,
	});
